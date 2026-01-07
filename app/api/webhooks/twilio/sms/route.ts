import { NextRequest, NextResponse } from 'next/server';
import { processIncomingSMS } from '@/lib/communication/sms-service';
import { prisma } from '@/lib/prisma';
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

        // Validate Twilio Signature (Optional for dev/demo but recommended)
        // const twilioSignature = req.headers.get('x-twilio-signature') || '';
        // const url = req.url;
        // const isValid = twilio.validateRequest(
        //     process.env.TWILIO_AUTH_TOKEN!,
        //     twilioSignature,
        //     url,
        //     Object.fromEntries(formData)
        // );

        // if (!isValid) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        console.log(`Received SMS from ${from}: ${body}`);

        const result = await processIncomingSMS(from, body);

        // Log the inbound message
        if (result.tenantId) {
            await prisma.communicationLog.create({
                data: {
                    tenantId: result.tenantId,
                    type: 'sms',
                    direction: 'INBOUND',
                    status: 'RECEIVED',
                    messageId: messageSid,
                    content: body,
                    subject: 'Incoming SMS',
                },
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
