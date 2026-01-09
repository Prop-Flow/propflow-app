import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

import { getSessionUser } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/errors/custom-errors';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        const snapshot = await db.collection('properties')
            .where('ownerUserId', '==', user.id)
            .orderBy('createdAt', 'desc')
            .get();

        const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Manual count of tenants for each property if needed
        // For simplicity, we'll return the properties as is
        return NextResponse.json({ properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        const body = await request.json();

        const propertyData = {
            name: body.property?.address || 'New Property',
            address: body.property?.address || '',
            city: body.property?.city,
            state: body.property?.state,
            zipCode: body.property?.zipCode,
            units: body.property?.units || 1,
            ownerUserId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const propertyRef = await db.collection('properties').add(propertyData);
        const propertyId = propertyRef.id;

        // Handle tenants
        const rentRollUnits = body.rentRollUnits;
        const tenantData = body.tenant;

        if (rentRollUnits && Array.isArray(rentRollUnits)) {
            const batch = db.batch();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rentRollUnits.forEach((unit: any) => {
                if (unit.tenantName && unit.tenantName.toLowerCase() !== 'vacant') {
                    const tenantRef = db.collection('tenants').doc();
                    batch.set(tenantRef, {
                        propertyId,
                        name: unit.tenantName,
                        email: unit.email || null,
                        phone: unit.phone || null,
                        rentAmount: unit.currentRent || unit.marketRent || 0,
                        leaseEndDate: unit.leaseEndDate ? new Date(unit.leaseEndDate) : null,
                        apartmentNumber: unit.unitNumber?.toString(),
                        status: 'active',
                        createdAt: new Date(),
                    });
                }
            });
            await batch.commit();
        } else if (tenantData) {
            await db.collection('tenants').add({
                propertyId,
                name: tenantData.name || 'Unknown Tenant',
                email: tenantData.email || null,
                phone: tenantData.phone || null,
                leaseStartDate: tenantData.leaseStartDate ? new Date(tenantData.leaseStartDate) : null,
                leaseEndDate: tenantData.leaseEndDate ? new Date(tenantData.leaseEndDate) : null,
                rentAmount: tenantData.rentAmount || 0,
                status: 'active',
                createdAt: new Date(),
            });
        }



        return NextResponse.json({ property: { id: propertyId, ...propertyData } }, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create property' },
            { status: 400 }
        );
    }
}
