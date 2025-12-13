import twilio from 'twilio';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/lib/utils/formatters';

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS to tenant
 */
export async function sendSMS(
    to: string,
    message: string,
    tenantId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('Twilio not configured, SMS not sent');
            return { success: false, error: 'Twilio not configured' };
        }

        const formattedPhone = formatPhoneNumber(to);

        const twilioMessage = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: formattedPhone,
        });

        // Log the communication
        await prisma.communicationLog.create({
            data: {
                tenantId,
                channel: 'sms',
                direction: 'outbound',
                message,
                status: 'sent',
                metadata: {
                    twilioSid: twilioMessage.sid,
                    to: formattedPhone,
                },
            },
        });

        return {
            success: true,
            messageId: twilioMessage.sid,
        };
    } catch (error: any) {
        console.error('Error sending SMS:', error);

        // Log failed attempt
        await prisma.communicationLog.create({
            data: {
                tenantId,
                channel: 'sms',
                direction: 'outbound',
                message,
                status: 'failed',
                metadata: {
                    error: error.message,
                    to,
                },
            },
        });

        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Process incoming SMS webhook from Twilio
 */
export async function processIncomingSMS(
    from: string,
    body: string
): Promise<{ tenantId?: string; message: string }> {
    try {
        // Find tenant by phone number
        const tenant = await prisma.tenant.findFirst({
            where: {
                phone: {
                    contains: from.replace(/\D/g, '').slice(-10), // Match last 10 digits
                },
            },
        });

        if (!tenant) {
            console.warn(`No tenant found for phone number: ${from}`);
            return {
                message: 'Tenant not found',
            };
        }

        // Log the incoming message
        await prisma.communicationLog.create({
            data: {
                tenantId: tenant.id,
                channel: 'sms',
                direction: 'inbound',
                message: body,
                status: 'received',
                metadata: {
                    from,
                },
            },
        });

        return {
            tenantId: tenant.id,
            message: body,
        };
    } catch (error) {
        console.error('Error processing incoming SMS:', error);
        throw error;
    }
}

/**
 * Get SMS delivery status from Twilio
 */
export async function getSMSStatus(messageSid: string): Promise<string> {
    try {
        const message = await twilioClient.messages(messageSid).fetch();
        return message.status;
    } catch (error) {
        console.error('Error fetching SMS status:', error);
        return 'unknown';
    }
}
