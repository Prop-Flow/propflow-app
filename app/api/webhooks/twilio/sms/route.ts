import { NextRequest, NextResponse } from 'next/server';
import { processIncomingSMS } from '@/lib/communication/sms-service';
import { db } from '@/lib/services/firebase-admin';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const from = formData.get('From') as string;
        const body = formData.get('Body') as string;
        const messageSid = formData.get('MessageSid') as string;

        if (!from || !body) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Validate Twilio Signature
        const twilioSignature = req.headers.get('x-twilio-signature') || '';
        const url = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/webhooks/twilio/sms';

        // In production, we must validate. In dev, we can skip if explicitly valid.
        // SECURITY: Default to validating unless explicitly disabled (Fail Secure)
        const shouldValidate = process.env.SKIP_WEBHOOK_VALIDATION !== 'true';

        if (shouldValidate) {
            const isValid = twilio.validateRequest(
                process.env.TWILIO_AUTH_TOKEN!,
                twilioSignature,
                url,
                Object.fromEntries(formData)
            );

            if (!isValid) {
                console.warn(`Invalid Twilio Signature from ${from}`);
                return new NextResponse('Unauthorized', { status: 401 });
            }
        }

        console.log(`Received SMS from ${from}: ${body}`);

        const result = await processIncomingSMS(from, body);

        // Log the inbound message
        if (result.tenantId) {
            const logRef = db.collection('communication_logs').doc();
            await logRef.set({
                id: logRef.id,
                tenantId: result.tenantId,
                type: 'sms',
                direction: 'INBOUND',
                status: 'RECEIVED',
                messageId: messageSid,
                content: body,
                subject: 'Incoming SMS',
                createdAt: new Date(),
            });
        }

        // Return TwiML to Twilio (empty response or auto-reply)
        const twiml = new twilio.twiml.MessagingResponse();
        return new NextResponse(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' },
        });

    } catch (error) {
        console.error('Error processing incoming SMS webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
