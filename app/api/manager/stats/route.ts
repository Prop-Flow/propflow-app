import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { verifyAuth } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const decodedToken = await verifyAuth(req);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const propertiesSnapshot = await db.collection('properties').count().get();
        const tenantsSnapshot = await db.collection('tenants').count().get();

        const propertyCount = propertiesSnapshot.data().count;
        const tenantCount = tenantsSnapshot.data().count;

        // Mocking values for now since logic was removed
        const requestCount = Math.floor(tenantCount / 3);
        const messageCount = 0;

        return NextResponse.json({
            properties: propertyCount,
            requests: requestCount,
            inquiries: tenantCount,
            messages: messageCount
        });
    } catch (error) {
        console.error("Failed to fetch manager stats", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
