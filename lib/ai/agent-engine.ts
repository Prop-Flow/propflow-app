import OpenAI from 'openai';
import { buildAgentPrompt } from './prompts';
import { storeTenantInteraction } from './vector-store';
import { register } from "@arizeai/phoenix-otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OpenAIInstrumentation } from "@opentelemetry/instrumentation-openai";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

// Initialize tracing
const provider = new NodeTracerProvider();
registerInstrumentations({
    instrumentations: [new OpenAIInstrumentation()],
});
provider.register();

// Initialize Phoenix
register({
    projectName: "propflow-agent",
});

import { SEQUENTIAL_THINKING_TOOL_DEF } from './tools/sequential-thinking';
import { MEMORY_TOOL_DEF, handleMemoryTool } from './tools/memory';
import { DATABASE_TOOL_DEF, handleDatabaseTool } from './tools/database';
import { GITHUB_TOOL_DEF, handleGitHubTool } from './tools/github';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }
    return openaiClient;
}

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
        // Build the prompt
        const prompt = buildAgentPrompt(context.scenario, {
            tenantName: context.tenantName,
            propertyAddress: context.propertyAddress,
            specificDetails: context.specificDetails,
            attemptNumber: context.attemptNumber,
            previousMessages: [], // Communication logs removed
        });

        // Generate response using OpenAI with Sequential Thinking support
        const openai = getOpenAIClient();
        const messages: any[] = [
            {
                role: 'system',
                content: 'You are a professional property management AI assistant. Generate concise, friendly, and professional messages. Use the sequential_thinking tool to plan your response for complex scenarios, ensuring you cover all requirements.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ];

        let finalResponse = '';
        let loopCount = 0;
        const MAX_LOOPS = 10;

        while (loopCount < MAX_LOOPS) {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages as any,
                temperature: 0.7,
                max_tokens: 400, // Increased for thinking thoughts
                tools: [
                    { type: 'function', function: SEQUENTIAL_THINKING_TOOL_DEF },
                    { type: 'function', function: MEMORY_TOOL_DEF },
                    { type: 'function', function: DATABASE_TOOL_DEF },
                    { type: 'function', function: GITHUB_TOOL_DEF }
                ],
                tool_choice: "auto",
            });

            const message = completion.choices[0]?.message;
            if (!message) break;

            // Add the assistant's response to history
            messages.push(message as any);

            if (message.tool_calls && message.tool_calls.length > 0) {
                // Handle tool calls
                for (const toolCall of message.tool_calls) {
                    if (toolCall.function.name === 'sequential_thinking') {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ status: 'thought_recorded', thoughtNumber: args.thoughtNumber }),
                            });
                        } catch (e) {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ status: 'error', error: 'Invalid arguments' }),
                            });
                        }
                    } else if (toolCall.function.name === 'memory_tool') {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            const result = await handleMemoryTool(args);
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: result,
                            });
                        } catch (e) {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ status: 'error', error: 'Memory operation failed' }),
                            });
                        }
                    } else if (toolCall.function.name === 'database_query') {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            const result = await handleDatabaseTool(args);
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: result,
                            });
                        } catch (e) {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ status: 'error', error: 'Database operation failed' }),
                            });
                        }
                    } else if (toolCall.function.name === 'github_tool') {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            const result = await handleGitHubTool(args);
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: result,
                            });
                        } catch (e) {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ status: 'error', error: 'GitHub operation failed' }),
                            });
                        }
                    }
                }
                loopCount++;
            } else {
                // No tool calls, this is the final response
                finalResponse = message.content || '';
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

        // Use OpenAI to analyze intent
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Analyze the tenant's message and determine their intent. 
          Classify as:
          - "positive": They agree, will comply, or confirm
          - "negative": They refuse, can't comply, or decline
          - "question": They have questions or need clarification
          - "unclear": Message is ambiguous or off-topic
          
          Also suggest if the workflow should be closed (positive response) or continue (other responses).
          
          Respond in JSON format: {"intent": "positive|negative|question|unclear", "shouldClose": true|false, "reasoning": "brief explanation"}`,
                },
                {
                    role: 'user',
                    content: `Tenant message: "${message}"`,
                },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

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
