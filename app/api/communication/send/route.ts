import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { sendWithFallback, CommunicationRequest } from '@/lib/communication/channel-router';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);
        // Ensure user is authorized (e.g. is a property manager or owner)
        // For now, assuming any authenticated user can send for valid tenants

        const body = await req.json();
        const { tenantId, message, subject } = body;

        if (!tenantId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Check permissions: User must own or manage the property the tenant belongs to
        // For MVP/Demo, skipping complex permission check, but in prod this is critical.

        const request: CommunicationRequest = {
            tenantId,
            tenantName: tenant.name,
            phone: tenant.phone || undefined,
            email: tenant.email || undefined,
            message,
            subject,
        };

        const result = await sendWithFallback(request);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
