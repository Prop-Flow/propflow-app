import { sendSMS } from './sms-service';
import { sendEmail } from './email-service';
import { initiateCall } from './voice-service';
import { determineNextChannel } from '@/lib/ai/agent-engine';
import { prisma } from '@/lib/prisma';

export type Channel = 'sms' | 'email' | 'voice';

export interface CommunicationRequest {
    tenantId: string;
    tenantName: string;
    phone?: string;
    email?: string;
    message: string;
    subject?: string;
    attemptNumber?: number;
}

/**
 * Route message through appropriate channel
 */
export async function routeMessage(
    request: CommunicationRequest,
    preferredChannel?: Channel
): Promise<{ success: boolean; channel: Channel; messageId?: string; error?: string }> {
    try {
        // Determine channel if not specified
        const channel = preferredChannel || await determineNextChannel();

        // Send via appropriate channel
        switch (channel) {
            case 'sms':
                if (!request.phone) {
                    return {
                        success: false,
                        channel: 'sms',
                        error: 'No phone number available for SMS',
                    };
                }
                const smsResult = await sendSMS(request.phone, request.message, request.tenantId);

                await logCommunication(
                    request.tenantId,
                    'sms',
                    request.message,
                    'OUTBOUND',
                    smsResult.success ? 'SENT' : 'FAILED',
                    smsResult.messageId,
                    undefined,
                    smsResult.error
                );

                return {
                    success: smsResult.success,
                    channel: 'sms',
                    messageId: smsResult.messageId,
                    error: smsResult.error,
                };

            case 'email':
                if (!request.email) {
                    return {
                        success: false,
                        channel: 'email',
                        error: 'No email address available',
                    };
                }
                const emailResult = await sendEmail(
                    request.email,
                    request.subject || 'Message from Your Property Manager',
                    request.message,
                    request.tenantId
                );

                await logCommunication(
                    request.tenantId,
                    'email',
                    request.message,
                    'OUTBOUND',
                    emailResult.success ? 'SENT' : 'FAILED',
                    emailResult.messageId,
                    request.subject,
                    emailResult.error
                );

                return {
                    success: emailResult.success,
                    channel: 'email',
                    messageId: emailResult.messageId,
                    error: emailResult.error,
                };

            case 'voice':
                if (!request.phone) {
                    return {
                        success: false,
                        channel: 'voice',
                        error: 'No phone number available for voice call',
                    };
                }
                const voiceResult = await initiateCall(request.phone, request.message, request.tenantId);

                await logCommunication(
                    request.tenantId,
                    'voice',
                    request.message,
                    'OUTBOUND',
                    voiceResult.success ? 'SENT' : 'FAILED',
                    voiceResult.callId,
                    undefined,
                    voiceResult.error
                );

                return {
                    success: voiceResult.success,
                    channel: 'voice',
                    messageId: voiceResult.callId,
                    error: voiceResult.error,
                };

            default:
                return {
                    success: false,
                    channel: 'sms',
                    error: 'Invalid channel',
                };
        }
    } catch (error: unknown) {
        console.error('Error routing message:', error);
        return {
            success: false,
            channel: preferredChannel || 'sms',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Helper to log communication
async function logCommunication(
    tenantId: string,
    type: string,
    content: string,
    direction: 'INBOUND' | 'OUTBOUND',
    status: 'SENT' | 'DELIVERED' | 'FAILED' | 'RECEIVED',
    messageId?: string,
    subject?: string,
    error?: string
) {
    try {
        await prisma.communicationLog.create({
            data: {
                tenantId,
                type,
                direction,
                status,
                messageId,
                content,
                subject,
                metadata: error ? { error } : undefined,
            },
        });
    } catch (e) {
        console.error('Failed to log communication:', e);
    }
}

/**
 * Send message with automatic fallback to alternative channels
 */
export async function sendWithFallback(
    request: CommunicationRequest
): Promise<{ success: boolean; channel: Channel; messageId?: string; error?: string }> {
    // Try primary channel
    const primaryChannel = await determineNextChannel();
    const primaryResult = await routeMessage(request, primaryChannel);

    if (primaryResult.success) {
        return primaryResult;
    }

    // Try fallback channels
    const fallbackChannels: Channel[] = (['sms', 'email', 'voice'] as Channel[]).filter(c => c !== primaryChannel);

    for (const channel of fallbackChannels) {
        const result = await routeMessage(request, channel);
        if (result.success) {
            return result;
        }
    }

    // All channels failed
    return {
        success: false,
        channel: primaryChannel,
        error: 'All communication channels failed',
    };
}
