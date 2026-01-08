import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { sendWithFallback, CommunicationRequest } from '@/lib/communication/channel-router';
import { db } from '@/lib/services/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);
        // Ensure user is authorized (e.g. is a property manager or owner)

        const body = await req.json();
        const { tenantId, message, subject } = body;

        if (!tenantId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const tenantDoc = await db.collection('tenants').doc(tenantId).get();
        if (!tenantDoc.exists) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const tenantData = tenantDoc.data();
        const propertyDoc = await db.collection('properties').doc(tenantData?.propertyId).get();

        if (!propertyDoc.exists) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const propertyData = propertyDoc.data();
        // Check permissions: User must own the property
        if (propertyData?.ownerUserId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const request: CommunicationRequest = {
            tenantId,
            tenantName: tenantData?.name || 'Unknown',
            phone: tenantData?.phone || undefined,
            email: tenantData?.email || undefined,
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
