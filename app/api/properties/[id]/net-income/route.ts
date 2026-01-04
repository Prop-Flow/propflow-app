import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await getSessionUser(request);
        const params = await props.params;
        const { id } = params;

        // Fetch financial data
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                income: true,
                expenses: true,
                debts: true
            }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // Calculate Monthly Metrics
        const monthlyIncome = (property.income || [])
            .filter(i => i.frequency === 'monthly')
            .reduce((sum, i) => sum + i.amount, 0);

        const monthlyExpenses = (property.expenses || [])
            .filter(e => e.frequency === 'monthly')
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlyDebtService = (property.debts || [])
            .reduce((sum, d) => sum + d.monthlyPayment, 0);

        // Annualized calculations
        const annualGrossIncome = monthlyIncome * 12;
        const vacancyRate = 0.05; // 5% standard
        const vacancyLoss = annualGrossIncome * vacancyRate;
        const effectiveGrossIncome = annualGrossIncome - vacancyLoss;

        const annualOperatingExpenses = monthlyExpenses * 12;
        const netOperatingIncome = effectiveGrossIncome - annualOperatingExpenses;
        const cashFlow = netOperatingIncome - (monthlyDebtService * 12);

        return NextResponse.json({
            grossIncome: annualGrossIncome,
            effectiveGrossIncome,
            totalExpenses: annualOperatingExpenses,
            vacancyLoss,
            monthlyNetIncome: netOperatingIncome / 12,
            annualNetIncome: netOperatingIncome,
            cashFlow,
            monthlyDebtService
        });

    } catch (error) {
        console.error('Error calculating net income:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
