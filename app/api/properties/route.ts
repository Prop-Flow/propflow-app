import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storePropertyInfo } from '@/lib/ai/vector-store';
import { getSessionUser } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/errors/custom-errors';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        const properties = await prisma.property.findMany({
            where: {
                ownerUserId: user.id
            },
            include: {
                _count: {
                    select: {
                        tenants: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

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

        // Flatten the nested data structure from the client (PropertyReviewModal)
        // body matches ExtractedPropertyData structure
        const flatData = {
            name: body.property?.address || 'New Property', // Fallback name
            address: body.property?.address || '',
            city: body.property?.city,
            state: body.property?.state,
            zipCode: body.property?.zipCode,
            units: body.property?.units || 1,
            ownerUserId: user.id,
        };

        interface TenantDataInput {
            name: string;
            email?: string | null;
            phone?: string | null;
            rentAmount: number;
            leaseStartDate?: string | Date;
            leaseEndDate?: string | Date;
        }

        interface RentRollUnit {
            tenantName?: string;
            currentRent?: number;
            marketRent?: number;
            leaseEndDate?: string | Date;
            unitNumber?: string | number;
            email?: string | null;
            phone?: string | null;
        }

        const tenantData = (body as { tenant?: TenantDataInput }).tenant;
        const rentRollUnits = (body as { rentRollUnits?: RentRollUnit[] }).rentRollUnits;

        let tenantsCreateInput;

        if (rentRollUnits && Array.isArray(rentRollUnits)) {
            // Filter out vacant units or empty names
            const occupiedUnits = rentRollUnits.filter((u: RentRollUnit) =>
                u.tenantName &&
                u.tenantName.toLowerCase() !== 'vacant' &&
                u.tenantName.trim() !== ''
            );

            if (occupiedUnits.length > 0) {
                tenantsCreateInput = {
                    create: occupiedUnits.map((unit: RentRollUnit) => ({
                        name: unit.tenantName || 'Unknown',
                        email: unit.email || null,
                        phone: unit.phone || null,
                        rentAmount: unit.currentRent || unit.marketRent || 0,
                        leaseEndDate: unit.leaseEndDate ? new Date(unit.leaseEndDate) : undefined,
                        apartmentNumber: unit.unitNumber?.toString(),
                        status: 'active'
                    }))
                };
            }
        } else if (tenantData) {
            tenantsCreateInput = {
                create: {
                    name: tenantData.name || 'Unknown Tenant',
                    email: tenantData.email,
                    phone: tenantData.phone,
                    leaseStartDate: tenantData.leaseStartDate ? new Date(tenantData.leaseStartDate) : undefined,
                    leaseEndDate: tenantData.leaseEndDate ? new Date(tenantData.leaseEndDate) : undefined,
                    rentAmount: tenantData.rentAmount,
                    status: 'active'
                }
            };
        }

        const property = await prisma.property.create({
            data: {
                ...flatData,
                tenants: tenantsCreateInput
            },
        });

        // Store property info in vector database for context
        await storePropertyInfo(property.id, {
            name: property.name,
            address: property.address,
            details: `Property - ${body.property?.beds || 0} Beds, ${body.property?.baths || 0} Baths`,
        });

        return NextResponse.json({ property }, { status: 201 });
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
