import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { getSessionUser } from '@/lib/auth/session';
import { isMVPDemoUser } from '@/lib/config/demo';
import { getMockProperties, getMockTenants } from '@/lib/services/demo-data';

/**
 * GET /api/billing/properties
 * Returns properties with their tenants for billing calculations
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        // Return mock data for demo users (no Firestore queries)
        if (user && isMVPDemoUser(user.email)) {
            const mockProperties = getMockProperties();
            const mockTenants = getMockTenants();

            // Attach tenants to properties
            const propertiesWithTenants = mockProperties.map(property => ({
                ...property,
                tenants: mockTenants.filter(t => t.propertyId === property.id)
            }));

            return NextResponse.json({
                properties: propertiesWithTenants
            });
        }

        // Fetch properties for regular users
        const propertiesSnapshot = await db.collection('properties')
            .where('ownerUserId', '==', user.id)
            .get();

        if (propertiesSnapshot.empty) {
            return NextResponse.json({ properties: [] });
        }

        // Fetch tenants for each property
        const properties = await Promise.all(
            propertiesSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const tenantsSnapshot = await db.collection('tenants')
                    .where('propertyId', '==', doc.id)
                    .get();

                return {
                    id: doc.id,
                    ...data,
                    tenants: tenantsSnapshot.docs.map(t => ({
                        id: t.id,
                        ...t.data()
                    }))
                };
            })
        );

        return NextResponse.json({ properties });
    } catch (error) {
        console.error('Error fetching billing properties:', error);
        return NextResponse.json(
            { error: 'Failed to fetch billing properties' },
            { status: 500 }
        );
    }
}
