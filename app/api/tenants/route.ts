import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { getSessionUser } from '@/lib/auth/session';
import { isMVPDemoUser } from '@/lib/config/demo';
import { getMockTenants } from '@/lib/services/demo-data';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        // Return mock data for demo users (no Firestore queries)
        if (isMVPDemoUser(user.email)) {
            return NextResponse.json({
                tenants: getMockTenants(propertyId || undefined)
            });
        }

        let query: FirebaseFirestore.Query = db.collection('tenants');

        if (propertyId) {
            // Check property access
            const propertyDoc = await db.collection('properties').doc(propertyId).get();
            if (!propertyDoc.exists || propertyDoc.data()?.ownerUserId !== user.id) {
                return NextResponse.json({ error: 'Property not found or access denied' }, { status: 403 });
            }
            query = query.where('propertyId', '==', propertyId);
        } else {
            // Need to filter by all user's properties (limited implementation)
            const propertySnapshot = await db.collection('properties')
                .where('ownerUserId', '==', user.id)
                .get();
            const propertyIds = propertySnapshot.docs.map(doc => doc.id);
            if (propertyIds.length === 0) return NextResponse.json({ tenants: [] });

            query = query.where('propertyId', 'in', propertyIds.slice(0, 30));
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ tenants });
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        const body = await request.json();

        // Check if property exists and belongs to the user
        const propertyDoc = await db.collection('properties').doc(body.propertyId).get();
        if (!propertyDoc.exists || propertyDoc.data()?.ownerUserId !== user.id) {
            return NextResponse.json(
                { error: 'Property not found or access denied' },
                { status: 404 }
            );
        }

        const tenantData = {
            propertyId: body.propertyId,
            name: body.name,
            email: body.email || null,
            phone: body.phone || null,
            leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : null,
            leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : null,
            rentAmount: body.rentAmount || 0,
            apartmentNumber: body.apartmentNumber || null,
            squareFootage: body.squareFootage || null,
            numberOfOccupants: body.numberOfOccupants || 1,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await db.collection('tenants').add(tenantData);
        const tenant = { id: docRef.id, ...tenantData };

        return NextResponse.json({ tenant }, { status: 201 });
    } catch (error) {
        console.error('Error creating tenant:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create tenant' },
            { status: 400 }
        );
    }
}
