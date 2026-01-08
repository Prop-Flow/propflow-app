import { NextRequest, NextResponse } from 'next/server';
import { processIncomingEmail } from '@/lib/communication/email-service';
import { db } from '@/lib/services/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { from, subject, html, text } = body;

        console.log(`Received Email from ${from}: ${subject}`);

        const result = await processIncomingEmail(from, subject, text || html);

        if (result.tenantId) {
            const logRef = db.collection('communication_logs').doc();
            await logRef.set({
                id: logRef.id,
                tenantId: result.tenantId,
                type: 'email',
                direction: 'INBOUND',
                status: 'RECEIVED',
                // messageId: body.id, // If available
                content: text || html,
                subject: subject,
                createdAt: new Date(),
            });
        }

        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('Error processing incoming Email webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
