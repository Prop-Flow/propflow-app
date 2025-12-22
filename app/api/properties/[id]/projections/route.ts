import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const {
            appreciationRate = 0.03, // 3%
            incomeGrowthRate = 0.02, // 2% 
            expenseGrowthRate = 0.015 // 1.5%
        } = body;

        // Fetch current baseline
        const property = await prisma.property.findUnique({
            where: { id },
            include: { income: true, expenses: true, valuations: { orderBy: { valuationDate: 'desc' }, take: 1 } }
        });

        if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

        let currentIncome = (property.income || []).reduce((s, i) => s + i.amount, 0) * 12;
        let currentExpenses = (property.expenses || []).reduce((s, e) => s + e.amount, 0) * 12;
        let currentValue = property.valuations?.[0]?.amount || (property.purchasePrice || 0);

        const projections = [];

        for (let year = 1; year <= 10; year++) {
            currentIncome *= (1 + incomeGrowthRate);
            currentExpenses *= (1 + expenseGrowthRate);
            currentValue *= (1 + appreciationRate);

            const noi = (currentIncome * 0.95) - currentExpenses;

            projections.push({
                year: new Date().getFullYear() + year,
                grossIncome: currentIncome,
                expenses: currentExpenses,
                netOperatingIncome: noi,
                propertyValue: currentValue
            });
        }

        return NextResponse.json({
            yearlyProjections: projections,
            assumedAppreciation: appreciationRate,
            assumedIncomeGrowth: incomeGrowthRate,
            assumedExpenseGrowth: expenseGrowthRate
        });

    } catch (error) {
        console.error('Error generating projections:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Re-use POST logic but with default assumptions
    return POST(request, { params });
}
