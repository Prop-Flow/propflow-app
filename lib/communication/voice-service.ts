import twilio from 'twilio';
import { formatPhoneNumber } from '@/lib/utils/formatters';

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Initiate outbound call to tenant with simple IVR
 */
export async function initiateCall(
    to: string,
    message: string,
    tenantId: string
): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('Twilio not configured, call not initiated');
            return { success: false, error: 'Twilio not configured' };
        }

        const formattedPhone = formatPhoneNumber(to);

        const call = await twilioClient.calls.create({
            twiml: generateCallTwiML(message),
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: formattedPhone,
            statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice/status`,
            statusCallbackEvent: ['completed'],
        });

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`Call initiated to ${to} for tenant ${tenantId}: ${message}`);

        return {
            success: true,
            callId: call.sid,
        };
    } catch (error: unknown) {
        console.error('Error initiating call:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Generate TwiML for outbound call with simple IVR
 */
export function generateCallTwiML(message: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${escapeXml(message)}</Say>
  <Gather numDigits="1" action="${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice/gather" method="POST">
    <Say voice="alice">Press 1 to confirm, or press 2 to speak with your property manager.</Say>
  </Gather>
  <Say voice="alice">We didn't receive your input. Goodbye.</Say>
</Response>`;
}

/**
 * Process IVR response
 */
export async function processIVRResponse(
    callSid: string,
    digits: string
): Promise<{ action: 'confirmed' | 'escalate' | 'unknown' }> {
    try {
        let action: 'confirmed' | 'escalate' | 'unknown' = 'unknown';

        if (digits === '1') {
            action = 'confirmed';
        } else if (digits === '2') {
            action = 'escalate';
        }

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`IVR response for call ${callSid}: ${digits} (${action})`);

        return { action };
    } catch (error) {
        console.error('Error processing IVR response:', error);
        return { action: 'unknown' };
    }
}

/**
 * Get call status from Twilio
 */
export async function getCallStatus(callSid: string): Promise<string> {
    try {
        const call = await twilioClient.calls(callSid).fetch();
        return call.status;
    } catch (error) {
        console.error('Error fetching call status:', error);
        return 'unknown';
    }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
