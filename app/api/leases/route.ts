import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const LeaseSchema = z.object({
    propertyId: z.string(),
    tenantId: z.string().optional().nullable(),
    type: z.enum(['RESIDENTIAL', 'COMMERCIAL']),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    rentAmount: z.number().min(0),
    securityDeposit: z.number().min(0),
    // Lease specific fields
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

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        const property = await prisma.property.findUnique({
            where: { id: propertyId, ownerUserId: session.id }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 403 });
        }

        const leases = await prisma.leaseAgreement.findMany({
            where: { propertyId },
            include: { tenant: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

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
        const property = await prisma.property.findUnique({
            where: { id: propertyId, ownerUserId: session.id }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid start or end date' }, { status: 400 });
        }

        const newLease = await prisma.leaseAgreement.create({
            data: {
                propertyId,
                tenantId: tenantId || null,
                type: data.type,
                startDate,
                endDate,
                rentAmount: data.rentAmount,
                securityDeposit: data.securityDeposit,
                leaseType: data.leaseType,
                escalationType: data.escalationType,
                escalationValue: data.escalationValue,
                // Store misc fields in terms JSON if schema doesn't support them directly
                // or if schema supports them:
                // isFurnished: data.isFurnished,
                // petsAllowed: data.petsAllowed,
                status: 'DRAFT'
            }
        });

        return NextResponse.json(newLease, { status: 201 });

    } catch (error) {
        console.error('Error creating lease:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
