import { NextRequest, NextResponse } from 'next/server';
import { processIncomingSMS } from '@/lib/communication/sms-service';
import { processInboundMessage } from '@/lib/ai/agent-engine';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const from = body.get('From') as string;
        const messageBody = body.get('Body') as string;

        if (!from || !messageBody) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Process incoming SMS and find tenant
        const { tenantId, message } = await processIncomingSMS(from, messageBody);

        if (!tenantId) {
            // Send generic response if tenant not found
            return new NextResponse(
                `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>We couldn't identify your account. Please contact your property manager directly.</Message>
</Response>`,
                {
                    headers: { 'Content-Type': 'text/xml' },
                }
            );
        }

        // Analyze the message intent
        const analysis = await processInboundMessage(tenantId, messageBody, 'sms');

        // Update workflow if needed based on intent
        if (analysis.shouldCloseWorkflow) {
            await prisma.workflowExecution.updateMany({
                where: {
                    tenantId,
                    status: 'running',
                },
                data: {
                    status: 'completed',
                    result: `Tenant responded: ${analysis.intent}`,
                },
            });
        }

        // Send acknowledgment via TwiML
        let responseMessage = 'Thank you for your response. We\'ll be in touch soon.';

        if (analysis.intent === 'positive') {
            responseMessage = 'Great! Thank you for confirming. We appreciate your prompt response.';
        } else if (analysis.intent === 'question') {
            responseMessage = 'Thank you for your message. Your property manager will respond to your question shortly.';
        }

        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`,
            {
                headers: { 'Content-Type': 'text/xml' },
            }
        );
    } catch (error) {
        console.error('Error processing SMS webhook:', error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, we encountered an error processing your message. Please try again later.</Message>
</Response>`,
            {
                headers: { 'Content-Type': 'text/xml' },
            }
        );
    }
}
