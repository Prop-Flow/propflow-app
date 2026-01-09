import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { verifyAuth } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Verify authentication
        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = decodedToken.uid;

        // Fetch properties owned by the user
        const propertiesSnapshot = await db.collection('properties')
            .where('ownerUserId', '==', userId)
            .get();

        const properties = propertiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate aggregates
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalNetIncome = 0;
        let totalVacancyRate = 0;
        let propertiesWithFinancials = 0;
        let totalActiveTenants = 0;

        for (const property of properties) {
            // Get active tenant count for each property
            const tenantsSnapshot = await db.collection('tenants')
                .where('propertyId', '==', property.id)
                .where('status', '==', 'active')
                .count()
                .get();

            totalActiveTenants += tenantsSnapshot.data().count;

            // Financials
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const financials = (property as any).financials;

            if (financials) {
                totalRevenue += financials.totalMonthlyIncome || 0;
                totalExpenses += financials.totalMonthlyExpenses || 0;
                totalNetIncome += financials.monthlyNetIncome || 0;
                totalVacancyRate += financials.vacancyRate || 0;
                propertiesWithFinancials++;
            }
        }

        const avgVacancyRate = propertiesWithFinancials > 0
            ? totalVacancyRate / propertiesWithFinancials
            : 0;

        // Fallback to rent estimation if financials are missing
        if (totalRevenue === 0 && totalActiveTenants > 0) {
            const activeTenantsSnapshot = await db.collection('tenants')
                .where('status', '==', 'active')
                .get();

            // Filter by property owner
            const propertyIds = properties.map(p => p.id);
            const tenantsForOwner = activeTenantsSnapshot.docs.filter(doc => propertyIds.includes(doc.data().propertyId));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            totalRevenue = tenantsForOwner.reduce((sum, doc) => sum + ((doc.data() as any).rentAmount || 0), 0);
            totalNetIncome = totalRevenue;
        }

        return NextResponse.json({
            properties: properties.length,
            tenants: totalActiveTenants,
            financials: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                netIncome: totalNetIncome,
                occupancyRate: Math.max(0, 100 - avgVacancyRate)
            }
        });

    } catch (error) {
        console.error('Error fetching owner stats:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
