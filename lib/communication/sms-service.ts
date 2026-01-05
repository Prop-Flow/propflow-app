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

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`SMS sent to ${to} for tenant ${tenantId}: ${message}`);

        return {
            success: true,
            messageId: twilioMessage.sid,
        };
    } catch (error: unknown) {
        console.error('Error sending SMS:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return {
            success: false,
            error: errorMessage,
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

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`Incoming SMS from ${from} for tenant ${tenant.id}: ${body}`);

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
