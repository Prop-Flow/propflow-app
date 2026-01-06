import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { differenceInDays } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await getSessionUser(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        // Build query filter
        const whereClause = propertyId ? { propertyId } : { property: { ownerUserId: session.id } };

        // Fetch tenants with their active lease agreements
        // We prioritize the structured LeaseAgreement if it exists, otherwise fallback to Tenant fields
        const tenants = await prisma.tenant.findMany({
            where: {
                ...whereClause,
                status: 'active'
            },
            include: {
                property: { select: { name: true } },
                leases: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // 2. Synthesize Rent Roll Data
        const rentRoll = tenants.map(tenant => {
            const activeLease = tenant.leases[0];

            // Determine effective values (Lease > Tenant Model)
            const rentAmount = activeLease?.rentAmount ?? tenant.rentAmount ?? 0;
            const leaseEnd = activeLease?.endDate ?? tenant.leaseEndDate;
            const leaseStart = activeLease?.startDate ?? tenant.leaseStartDate;
            const securityDeposit = activeLease?.securityDeposit ?? 0;

            // 3. Turnover Risk Analysis
            let riskStatus = 'LOW';
            let daysUntilExpiration = null;

            if (leaseEnd) {
                const today = new Date();
                daysUntilExpiration = differenceInDays(new Date(leaseEnd), today);

                if (daysUntilExpiration < 0) {
                    riskStatus = 'EXPIRED'; // Month-to-month or holdover
                } else if (daysUntilExpiration <= 30) {
                    riskStatus = 'CRITICAL'; // Immediate turnover risk
                } else if (daysUntilExpiration <= 90) {
                    riskStatus = 'HIGH'; // Upcoming vacancy
                } else if (daysUntilExpiration <= 180) {
                    riskStatus = 'MEDIUM';
                }
            }

            return {
                id: tenant.id,
                tenantName: tenant.name,
                propertyName: tenant.property.name,
                unit: tenant.apartmentNumber || 'N/A',
                type: tenant.numberOfOccupants > 0 ? 'Residential' : 'Commercial', // Simple heuristic or fetch from property
                sqFt: tenant.squareFootage || 0,
                rent: rentAmount,
                deposit: securityDeposit,
                leaseStart: leaseStart ? leaseStart.toISOString().split('T')[0] : 'N/A',
                leaseEnd: leaseEnd ? leaseEnd.toISOString().split('T')[0] : 'N/A',
                daysUntilExpiration,
                riskStatus,
                status: tenant.status
            };
        });

        // Calculate Totals
        const summary = {
            totalMonthlyRent: rentRoll.reduce((sum, item) => sum + item.rent, 0),
            totalDeposits: rentRoll.reduce((sum, item) => sum + item.deposit, 0),
            totalSqFt: rentRoll.reduce((sum, item) => sum + item.sqFt, 0),
            occupancyCount: rentRoll.length,
            riskBreakdown: {
                critical: rentRoll.filter(r => r.riskStatus === 'CRITICAL').length,
                high: rentRoll.filter(r => r.riskStatus === 'HIGH').length,
                expired: rentRoll.filter(r => r.riskStatus === 'EXPIRED').length
            }
        };

        return NextResponse.json({
            generatedAt: new Date().toISOString(),
            summary,
            rentRoll
        });

    } catch (error) {
        console.error('Error generating rent roll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
