import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;

        // Fetch properties with financials and tenant counts
        const properties = await prisma.property.findMany({
            where: {
                ownerUserId: userId
            },
            include: {
                financials: true,
                _count: {
                    select: { tenants: { where: { status: 'active' } } }
                }
            }
        });

        // Calculate aggregates
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalNetIncome = 0;
        let totalVacancyRate = 0;
        let propertiesWithFinancials = 0;
        let totalTenants = 0;

        for (const property of properties) {
            totalTenants += property._count.tenants;

            if (property.financials) {
                totalRevenue += property.financials.totalMonthlyIncome || 0;
                totalExpenses += property.financials.totalMonthlyExpenses || 0;
                totalNetIncome += property.financials.monthlyNetIncome || 0;
                totalVacancyRate += property.financials.vacancyRate || 0;
                propertiesWithFinancials++;
            }
        }

        const avgVacancyRate = propertiesWithFinancials > 0
            ? totalVacancyRate / propertiesWithFinancials
            : 0;

        // If no financials exist, try to estimate from rent roll (fallback)
        // This is a "nice to have" if the financials table is empty but tenants exist
        if (totalRevenue === 0 && totalTenants > 0) {
            // Quick fallback: Fetch active tenants rents
            const tenants = await prisma.tenant.findMany({
                where: {
                    property: { ownerUserId: userId },
                    status: 'active'
                },
                select: { rentAmount: true }
            });
            totalRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
            totalNetIncome = totalRevenue; // Assume 0 expenses for fallback
        }

        return NextResponse.json({
            properties: properties.length,
            tenants: totalTenants,
            financials: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                netIncome: totalNetIncome,
                occupancyRate: Math.max(0, 100 - avgVacancyRate) // simplistic
            }
        });

    } catch (error) {
        console.error('Error fetching owner stats:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
