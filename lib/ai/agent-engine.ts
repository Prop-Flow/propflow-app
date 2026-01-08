import { VertexAI, FunctionDeclaration } from '@google-cloud/vertexai';
import { buildAgentPrompt } from './prompts';
import { storeTenantInteraction } from './vector-store';
import { initTracing } from './otel';

// Initialize tracing
initTracing();

import { SEQUENTIAL_THINKING_TOOL_DEF } from './tools/sequential-thinking';
import { MEMORY_TOOL_DEF, handleMemoryTool } from './tools/memory';
import { DATABASE_TOOL_DEF, handleDatabaseTool } from './tools/database';
import { GITHUB_TOOL_DEF, handleGitHubTool } from './tools/github';

// Initialize Vertex AI
const project = process.env.GOOGLE_CLOUD_PROJECT || 'propflow-ai-483621';
const location = 'us-east5';
const vertex_ai = new VertexAI({ project: project, location: location });

// Specialized model for reasoning and extraction
const modelName = "gemini-1.5-pro-001";

// Helper to convert simple JSON schema objects to Vertex AI FunctionDeclaration
// Note: We are assuming our tool definitions are close enough or we strictly define them here if needed.
// Only the top-level structure needs to match FunctionDeclaration.
const tools: { functionDeclarations: FunctionDeclaration[] }[] = [{
    functionDeclarations: [
        {
            name: SEQUENTIAL_THINKING_TOOL_DEF.name,
            description: SEQUENTIAL_THINKING_TOOL_DEF.description,
            parameters: SEQUENTIAL_THINKING_TOOL_DEF.parameters as unknown as FunctionDeclaration['parameters'] // Casting as structure implies compatibility
        },
        {
            name: MEMORY_TOOL_DEF.name,
            description: MEMORY_TOOL_DEF.description,
            parameters: MEMORY_TOOL_DEF.parameters as unknown as FunctionDeclaration['parameters']
        },
        {
            name: DATABASE_TOOL_DEF.name,
            description: DATABASE_TOOL_DEF.description,
            parameters: DATABASE_TOOL_DEF.parameters as unknown as FunctionDeclaration['parameters']
        },
        {
            name: GITHUB_TOOL_DEF.name,
            description: GITHUB_TOOL_DEF.description,
            parameters: GITHUB_TOOL_DEF.parameters as unknown as FunctionDeclaration['parameters']
        }
    ]
}];

export type AgentScenario = 'lease_renewal' | 'document_collection' | 'maintenance_followup' | 'escalation';

export interface AgentContext {
    tenantId: string;
    tenantName: string;
    propertyAddress: string;
    scenario: AgentScenario;
    specificDetails: string;
    attemptNumber?: number;
}

/**
 * Generate AI response for tenant communication
 */
export async function generateAgentResponse(context: AgentContext): Promise<string> {
    try {
        // Auto-retrieve recent memories to set context
        const recentMemories = await handleMemoryTool({ action: 'list' }).catch(() => "[]");

        // Build the prompt
        const prompt = buildAgentPrompt(context.scenario, {
            tenantName: context.tenantName,
            propertyAddress: context.propertyAddress,
            specificDetails: context.specificDetails,
            attemptNumber: context.attemptNumber,
            previousMessages: [], // Communication logs removed
        });

        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: modelName,
            generationConfig: {
                maxOutputTokens: 2048, // Increased for thinking thoughts
                temperature: 0.7,
                topP: 0.95,
            },
        });

        const chat = generativeModel.startChat({
            tools: tools,
        });

        const systemMessage = `You are a professional property management AI assistant. Generate concise, friendly, and professional messages. 
                Use the sequential_thinking tool to plan your response for complex scenarios.
                
                RECENT MEMORIES:
                ${recentMemories}
                `;

        // Initial message with system context (Vertex AI supports system instructions differently in preview, but prepending works)
        // Actually, startChat doesn't take system instructions directly in current Node SDK preview easily without config, 
        // passing it as part of first user message is reliable.
        const fullPrompt = `${systemMessage}\n\nUser Request: ${prompt}`;

        let currentResponse = await chat.sendMessage(fullPrompt);
        let finalResponseText = '';

        const MAX_LOOPS = 10;
        let loopCount = 0;

        while (loopCount < MAX_LOOPS) {
            const candidates = currentResponse.response.candidates;
            if (!candidates || candidates.length === 0) break;

            const content = candidates[0].content;
            const functionCalls = content.parts.filter(part => part.functionCall).map(part => part.functionCall!);

            if (functionCalls.length > 0) {
                const functionResponses = [];

                for (const call of functionCalls) {
                    const functionName = call.name;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const args = call.args as any;

                    console.log(`Executing tool: ${functionName}`);

                    let functionResponse = {};
                    if (functionName === 'sequential_thinking') {
                        // Just log thinking, no return value needed really to change flow, but we verify it
                        functionResponse = { status: 'thought_recorded', thoughtNumber: args.thoughtNumber };
                    } else if (functionName === 'memory_tool') {
                        const result = await handleMemoryTool(args);
                        functionResponse = { result };
                    } else if (functionName === 'database_query') {
                        const result = await handleDatabaseTool(args);
                        functionResponse = { result };
                    } else if (functionName === 'github_tool') {
                        const result = await handleGitHubTool(args);
                        functionResponse = { result };
                    }

                    functionResponses.push({
                        functionResponse: {
                            name: functionName,
                            response: { name: functionName, content: functionResponse }
                        }
                    });
                }

                // Send function responses back to model
                currentResponse = await chat.sendMessage(functionResponses);
            } else {
                // No function calls, this is the final text
                finalResponseText = content.parts.map(p => p.text).join('') || '';
                break;
            }
            loopCount++;
        }

        return finalResponseText.trim() || "I apologize, but I couldn't generate a response at this time.";
    } catch (error) {
        console.error('Error generating agent response:', error);
        throw new Error('Failed to generate AI response');
    }
}

/**
 * Determine if escalation to human is needed
 */
export function shouldEscalate(attemptCount: number, maxAttempts: number = 5): boolean {
    return attemptCount >= maxAttempts;
}

/**
 * Determine next communication channel based on attempt history
 */
export async function determineNextChannel(): Promise<'sms' | 'email' | 'voice'> {
    // Strategy: Default to SMS for now as history logic was removed
    return 'sms';
}

/**
 * Process tenant response and determine next action
 */
export async function processInboundMessage(
    tenantId: string,
    message: string,
    channel: 'sms' | 'email' | 'voice'
): Promise<{
    intent: 'positive' | 'negative' | 'question' | 'unclear';
    suggestedResponse?: string;
    shouldCloseWorkflow: boolean;
}> {
    try {
        // Store the interaction in vector database
        await storeTenantInteraction(tenantId, {
            message,
            channel,
            timestamp: new Date(),
            metadata: { direction: 'inbound' },
        });

        // Use Vertex AI to analyze intent
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: modelName,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.3,
                responseMimeType: 'application/json'
            },
        });

        const prompt = `Analyze the tenant's message and determine their intent. 
          Classify as:
          - "positive": They agree, will comply, or confirm
          - "negative": They refuse, can't comply, or decline
          - "question": They have questions or need clarification
          - "unclear": Message is ambiguous or off-topic
          
          Also suggest if the workflow should be closed (positive response) or continue (other responses).
          
          Respond in JSON format: {"intent": "positive|negative|question|unclear", "shouldClose": true|false, "reasoning": "brief explanation"}
          
          Tenant message: "${message}"`;

        const result = await generativeModel.generateContent(prompt);
        const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch {
            // Handle markdown code blocks if Gemini wraps it
            const clean = text.replace(/^```json/, '').replace(/```$/, '').trim();
            analysis = JSON.parse(clean);
        }

        return {
            intent: analysis.intent || 'unclear',
            shouldCloseWorkflow: analysis.shouldClose || false,
        };
    } catch (error) {
        console.error('Error processing inbound message:', error);
        return {
            intent: 'unclear',
            shouldCloseWorkflow: false,
        };
    }
}
