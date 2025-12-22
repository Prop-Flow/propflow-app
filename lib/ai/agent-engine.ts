import OpenAI from 'openai';
import { buildAgentPrompt } from './prompts';
import { storeTenantInteraction } from './vector-store';
import { prisma } from '@/lib/prisma';

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
        // Retrieve previous interactions from vector store
        // Retrieve previous interactions from vector store
        // const previousContext = await getTenantContext(context.tenantId, context.specificDetails, 3);

        // Get recent communication logs from database
        const recentLogs = await prisma.communicationLog.findMany({
            where: { tenantId: context.tenantId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const previousMessages = recentLogs.map(log => log.message);

        // Build the prompt
        const prompt = buildAgentPrompt(context.scenario, {
            tenantName: context.tenantName,
            propertyAddress: context.propertyAddress,
            specificDetails: context.specificDetails,
            attemptNumber: context.attemptNumber,
            previousMessages,
        });

        // Generate response using OpenAI
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional property management AI assistant. Generate concise, friendly, and professional messages.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const response = completion.choices[0]?.message?.content || '';

        return response.trim();
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
export async function determineNextChannel(
    tenantId: string
): Promise<'sms' | 'email' | 'voice'> {
    // Get recent communication logs
    const recentLogs = await prisma.communicationLog.findMany({
        where: {
            tenantId,
            direction: 'outbound',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    // Strategy: SMS → Email → SMS → Voice → Email
    const channelSequence: Array<'sms' | 'email' | 'voice'> = ['sms', 'email', 'sms', 'voice', 'email'];

    // If we have recent logs, check what was used last
    if (recentLogs.length > 0) {
        const lastChannel = recentLogs[0].channel as 'sms' | 'email' | 'voice';

        // Find next channel in sequence
        const currentIndex = channelSequence.indexOf(lastChannel);
        const nextIndex = (currentIndex + 1) % channelSequence.length;
        return channelSequence[nextIndex];
    }

    // Default to SMS for first contact
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
            model: 'gpt-4',
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
