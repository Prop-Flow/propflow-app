import { buildAgentPrompt } from './prompts';
import { storeTenantInteraction } from './vector-store';
import { initTracing } from './otel';
import { vertexService } from './vertex';
import {
    Content,
    Part,
    Tool
} from '@google-cloud/vertexai';

// Initialize tracing
initTracing();

import { SEQUENTIAL_THINKING_TOOL_DEF } from './tools/sequential-thinking';
import { MEMORY_TOOL_DEF, handleMemoryTool } from './tools/memory';
import { DATABASE_TOOL_DEF, handleDatabaseTool } from './tools/database';

export type AgentScenario = 'lease_renewal' | 'document_collection' | 'maintenance_followup' | 'escalation';

export interface AgentContext {
    tenantId: string;
    tenantName: string;
    propertyAddress: string;
    scenario: AgentScenario;
    specificDetails: string;
    attemptNumber?: number;
}

// Map OpenAI-style tool definitions to Vertex AI FunctionDeclarations
const vertexTools: Tool[] = [{
    functionDeclarations: [
        {
            name: SEQUENTIAL_THINKING_TOOL_DEF.name,
            description: SEQUENTIAL_THINKING_TOOL_DEF.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: SEQUENTIAL_THINKING_TOOL_DEF.parameters as any
        },
        {
            name: MEMORY_TOOL_DEF.name,
            description: MEMORY_TOOL_DEF.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: MEMORY_TOOL_DEF.parameters as any
        },
        {
            name: DATABASE_TOOL_DEF.name,
            description: DATABASE_TOOL_DEF.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: DATABASE_TOOL_DEF.parameters as any
        }
    ]
}];

/**
 * Generate AI response for tenant communication
 */
export async function generateAgentResponse(context: AgentContext): Promise<string> {
    try {
        // Auto-retrieve recent memories to set context
        const recentMemories = await handleMemoryTool({ action: 'list' }).catch(() => "[]");

        // Build the prompt
        const promptText = buildAgentPrompt(context.scenario, {
            tenantName: context.tenantName,
            propertyAddress: context.propertyAddress,
            specificDetails: context.specificDetails,
            attemptNumber: context.attemptNumber,
            previousMessages: [], // Communication logs removed
        });

        // Initialize session with Gemini 1.5 Pro
        const history: Content[] = [
            {
                role: 'user',
                parts: [{
                    text: `You are a professional property management AI assistant. Generate concise, friendly, and professional messages. 
                Use the sequential_thinking tool to plan your response for complex scenarios.
                
                RECENT MEMORIES:
                ${recentMemories}

                TASK:
                ${promptText}`
                }],
            }
        ];

        let finalResponse = '';
        let loopCount = 0;
        const MAX_LOOPS = 10;
        let consecutiveErrorCount = 0;
        const MAX_CONSECUTIVE_ERRORS = 3;

        while (loopCount < MAX_LOOPS) {
            // Circuit breaker
            if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS) {
                finalResponse = "I encountered multiple errors while trying to process your request. Please check the logs or try again with a simpler request.";
                break;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await vertexService.generativeModel.generateContent({
                contents: history,
                tools: vertexTools,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const response = await result.response;
            const responseContent = response.candidates?.[0]?.content;

            if (!responseContent) break;

            // Add assistant response to history
            history.push(responseContent);

            const toolCalls = responseContent.parts.filter(p => p.functionCall);

            if (toolCalls.length > 0) {
                const toolResponses: Part[] = [];

                for (const part of toolCalls) {
                    const toolCall = part.functionCall!;
                    const name = toolCall.name;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const args = toolCall.args as any;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let resultData: any;
                    try {
                        if (name === 'sequential_thinking') {
                            resultData = { status: 'thought_recorded', thoughtNumber: args.thoughtNumber };
                        } else if (name === 'memory_tool') {
                            resultData = await handleMemoryTool(args);
                        } else if (name === 'database_query') {
                            resultData = await handleDatabaseTool(args);
                        }
                        consecutiveErrorCount = 0;
                    } catch (e) {
                        consecutiveErrorCount++;
                        resultData = { status: 'error', error: (e as Error).message };
                    }

                    toolResponses.push({
                        functionResponse: {
                            name,
                            response: { content: resultData }
                        }
                    });
                }

                // Add tool responses to history
                history.push({
                    role: 'function',
                    parts: toolResponses
                });
                loopCount++;
            } else {
                // No tool calls, this is the final response
                finalResponse = responseContent.parts[0]?.text || '';
                break;
            }
        }

        return finalResponse.trim() || "I apologize, but I couldn't generate a response at this time.";
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

        // Use Gemini Flash for intent analysis (cheaper/faster)
        const prompt = `Analyze the tenant's message and determine their intent. 
          Classify as:
          - "positive": They agree, will comply, or confirm
          - "negative": They refuse, can't comply, or decline
          - "question": They have questions or need clarification
          - "unclear": Message is ambiguous or off-topic
          
          Also suggest if the workflow should be closed (positive response) or continue (other responses).
          
          Tenant message: "${message}"
          
          Respond in JSON format: {"intent": "positive|negative|question|unclear", "shouldClose": true|false, "reasoning": "brief explanation"}`;

        const responseText = await vertexService.generateText(prompt);
        // Extract JSON from potential markdown blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

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
