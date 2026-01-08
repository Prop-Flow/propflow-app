import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        // Fetch properties owned by the user
        const propertiesSnapshot = await db.collection('properties')
            .where('ownerUserId', '==', user.id)
            .get();

        if (propertiesSnapshot.empty) {
            return NextResponse.json([]);
        }

        const propertyIds = propertiesSnapshot.docs.map(doc => doc.id);
        const propertiesMap = propertiesSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { id: doc.id, ...doc.data() };
            return acc;
        }, {} as Record<string, Record<string, unknown>>);

        // Fetch pending tenants for these properties
        const tenantsSnapshot = await db.collection('tenants')
            .where('status', '==', 'pending')
            .where('propertyId', 'in', propertyIds.slice(0, 10))
            .orderBy('createdAt', 'desc')
            .get();

        const tenants = tenantsSnapshot.docs.map(doc => {
            const data = doc.data();
            const property = propertiesMap[data.propertyId];
            return {
                id: doc.id,
                name: data.name,
                email: data.email || null,
                status: data.status,
                createdAt: data.createdAt,
                property: {
                    id: property?.id,
                    name: property?.name,
                    address: property?.address,
                }
            };
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Error fetching pending tenants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending tenants' },
            { status: 500 }
        );
    }
}
