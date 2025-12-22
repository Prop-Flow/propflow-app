import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { documentType, tenantEmail, tenantName } = body;

        // Validation
        if (!documentType || !tenantEmail || !tenantName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mock signing process logic
        // In reality, this would integrate with e.g. Docusign or HelloSign API

        console.log(`[Mock Signer] Sending ${documentType} to ${tenantName} (${tenantEmail})`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            result: {
                envelopeId: 'env_' + Math.random().toString(36).substring(2, 10),
                status: 'sent'
            }
        });

    } catch (error) {
        console.error('Signing request failed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
