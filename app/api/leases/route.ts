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

export async function POST(request: NextRequest) {
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
