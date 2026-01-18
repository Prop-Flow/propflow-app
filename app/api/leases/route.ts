import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';
import { isMVPDemoUser } from '@/lib/config/demo';
import { getMockLeases } from '@/lib/services/demo-data';

const LeaseSchema = z.object({
    propertyId: z.string(),
    tenantId: z.string().optional().nullable(),
    type: z.enum(['RESIDENTIAL', 'COMMERCIAL']),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    rentAmount: z.number().min(0),
    securityDeposit: z.number().min(0),
    leaseType: z.string().optional().nullable(),
    escalationType: z.string().optional().nullable(),
    escalationValue: z.number().optional().nullable(),
    isFurnished: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getSessionUser(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return mock data for demo users (no Firestore queries)
        if (isMVPDemoUser(session.email)) {
            const searchParams = request.nextUrl.searchParams;
            const propertyId = searchParams.get('propertyId');
            return NextResponse.json(getMockLeases(propertyId || undefined));
        }

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        const propertyDoc = await db.collection('properties').doc(propertyId).get();
        if (!propertyDoc.exists || propertyDoc.data()?.ownerUserId !== session.id) {
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 403 });
        }

        const snapshot = await db.collection('leaseAgreements')
            .where('propertyId', '==', propertyId)
            .orderBy('createdAt', 'desc')
            .get();

        const leases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(leases);

    } catch (error) {
        console.error('Error fetching leases:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionUser(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validation
        const result = LeaseSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
        }

        const { propertyId, tenantId, ...data } = result.data;

        // Verify property ownership
        const propertyDoc = await db.collection('properties').doc(propertyId).get();
        if (!propertyDoc.exists || propertyDoc.data()?.ownerUserId !== session.id) {
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid start or end date' }, { status: 400 });
        }

        const leaseData = {
            propertyId,
            tenantId: tenantId || null,
            type: data.type,
            startDate,
            endDate,
            rentAmount: data.rentAmount,
            securityDeposit: data.securityDeposit,
            leaseType: data.leaseType || null,
            escalationType: data.escalationType || null,
            escalationValue: data.escalationValue || null,
            status: 'DRAFT',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await db.collection('leaseAgreements').add(leaseData);
        const newLease = { id: docRef.id, ...leaseData };

        return NextResponse.json(newLease, { status: 201 });

    } catch (error) {
        console.error('Error creating lease:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
