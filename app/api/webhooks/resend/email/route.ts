import { NextRequest, NextResponse } from 'next/server';
import { processIncomingEmail } from '@/lib/communication/email-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { from, subject, html, text } = body;

        // Note: Resend incoming webhooks might vary in structure depending on the setup (e.g. if using a forwarder or direct webhook)
        // This assumes a standard structure similar to Postmark or other providers, adapted for Resend webhooks if they exist or a custom forwarder.
        // If Resend doesn't support inbound natively yet in the same way, this might need adjustment, but for now we follow the pattern.

        console.log(`Received Email from ${from}: ${subject}`);

        const result = await processIncomingEmail(from, subject, text || html);

        if (result.tenantId) {
            await prisma.communicationLog.create({
                data: {
                    tenantId: result.tenantId,
                    type: 'email',
                    direction: 'INBOUND',
                    status: 'RECEIVED',
                    // messageId: body.id, // If available
                    content: text || html,
                    subject: subject,
                },
            });
        }

        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('Error processing incoming Email webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
