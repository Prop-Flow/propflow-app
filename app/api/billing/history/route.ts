import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get('propertyId');
        const tenantId = searchParams.get('tenantId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!propertyId && !tenantId) {
            return NextResponse.json(
                { error: 'Must provide either propertyId or tenantId' },
                { status: 400 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {};
        if (propertyId) whereClause.propertyId = propertyId;
        if (startDate && endDate) {
            whereClause.billingPeriod = {
                gte: startDate,
                lte: endDate
            };
            // Alternatively query created/dates
        }

        // If tenantId provided, we need to join slightly differently or filter
        if (tenantId) {
            const charges = await prisma.tenantUtilityCharge.findMany({
                where: {
                    tenantId: tenantId,
                    utilityBill: propertyId ? { propertyId: propertyId } : undefined
                },
                include: {
                    utilityBill: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return NextResponse.json(charges);
        }

        const bills = await prisma.utilityBill.findMany({
            where: whereClause,
            include: {
                tenantCharges: {
                    include: {
                        tenant: {
                            select: {
                                name: true,
                                apartmentNumber: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(bills);

    } catch (error) {
        console.error('Error fetching billing history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch billing history' },
            { status: 500 }
        );
    }
}
