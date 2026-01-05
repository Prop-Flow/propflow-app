import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        // Filter by user's properties to ensure data isolation
        const where: any = {
            property: {
                ownerUserId: user.id
            }
        };

        if (propertyId) {
            where.propertyId = propertyId;
        }

        const tenants = await prisma.tenant.findMany({
            where,
            include: {
                property: true,
                _count: {
                    select: {
                        // All these were removed from schema
                        // documents: true, 
                        // communicationLogs: true, 
                        // complianceItems: true, 
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

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
        const property = await prisma.property.findFirst({
            where: {
                id: body.propertyId,
                ownerUserId: user.id
            },
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found or access denied' },
                { status: 404 }
            );
        }

        const tenant = await prisma.tenant.create({
            data: {
                propertyId: body.propertyId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : undefined,
                leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : undefined,
                rentAmount: body.rentAmount,
                apartmentNumber: body.apartmentNumber,
                squareFootage: body.squareFootage,
                numberOfOccupants: body.numberOfOccupants || 1,
                status: 'active'
            },
        });

        return NextResponse.json({ tenant }, { status: 201 });
    } catch (error) {
        console.error('Error creating tenant:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create tenant' },
            { status: 400 }
        );
    }
}
