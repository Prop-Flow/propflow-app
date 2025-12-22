import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRubs, validateBillingData } from '@/lib/billing/rubs-calculator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { propertyId, totalUtilityCost, billingPeriod, createRecord, utilityType, startDate, endDate } = body;

        if (!propertyId || totalUtilityCost === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: propertyId and totalUtilityCost' },
                { status: 400 }
            );
        }

        // 1. Fetch active tenants for the property
        const tenants = await prisma.tenant.findMany({
            where: {
                propertyId,
                status: 'active',
            },
            select: {
                id: true,
                name: true,
                squareFootage: true,
                numberOfOccupants: true,
                apartmentNumber: true,
            },
        });

        if (tenants.length === 0) {
            return NextResponse.json(
                { error: 'No active tenants found for this property' },
                { status: 404 }
            );
        }

        // 2. Validate data
        const validTenantsForCalculation = validateBillingData(tenants);

        // Check if we have invalid tenants that were filtered out
        if (validTenantsForCalculation.length < tenants.length) {
            // Optionally warn or fail. For now we proceeed but maybe return a warning?
            console.warn(`Filtered out ${tenants.length - validTenantsForCalculation.length} tenants due to missing R.U.B.S data`);
        }

        // 3. Calculate breakdown
        const breakdown = calculateRubs(totalUtilityCost * 100, validTenantsForCalculation); // Convert dollars to cents for calculation if input is dollars? Assumption: input is dollars

        // Map back to include tenant details
        const detailedBreakdown = breakdown.map(item => {
            const tenant = tenants.find(t => t.id === item.tenantId);
            return {
                ...item,
                tenantName: tenant?.name,
                apartmentNumber: tenant?.apartmentNumber,
                chargeAmount: item.chargeAmount / 100, // Convert back to dollars
                breakdown: {
                    sqftPortion: item.breakdown.sqftPortion / 100,
                    occupancyPortion: item.breakdown.occupancyPortion / 100
                }
            };
        });

        // 4. Save to database if requested
        let savedBill = null;
        if (createRecord && billingPeriod) {
            savedBill = await prisma.$transaction(async (tx) => {
                const bill = await tx.utilityBill.create({
                    data: {
                        propertyId,
                        billingPeriod,
                        utilityType: utilityType || 'total',
                        totalCost: totalUtilityCost, // Store as provided (dollars) for consistency with current schema usage? or cents? 
                        // Note: Schema doesn't specify currency. Usually best to store as integers (cents), but typical JS usage often uses float dollars.
                        // Let's stick to float dollars as implied by 'Float' type in Prisma, but calculation used cents.
                        startDate: startDate ? new Date(startDate) : new Date(),
                        endDate: endDate ? new Date(endDate) : new Date(),
                        status: 'calculated',
                    },
                });

                for (const item of breakdown) {
                    // Need to fetch current tenant data to snapshot it
                    const tParams = validTenantsForCalculation.find(t => t.id === item.tenantId);

                    await tx.tenantUtilityCharge.create({
                        data: {
                            utilityBillId: bill.id,
                            tenantId: item.tenantId,
                            chargeAmount: item.chargeAmount / 100, // Store as float dollars
                            squareFootageRatio: item.squareFootageRatio,
                            occupancyRatio: item.occupancyRatio,
                            squareFootageCost: item.squareFootageCost / 100,
                            occupancyCost: item.occupancyCost / 100,
                            tenantSquareFootage: tParams?.squareFootage || 0,
                            tenantOccupants: tParams?.numberOfOccupants || 0
                        }
                    });
                }
                return bill;
            });
        }

        return NextResponse.json({
            breakdown: detailedBreakdown,
            savedBill,
        });

    } catch (error) {
        console.error('Error calculating R.U.B.S:', error);
        return NextResponse.json(
            { error: 'Failed to calculate billing' },
            { status: 500 }
        );
    }
}
