import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        const property = await prisma.property.findUnique({
            where: { id },
            include: { expenses: true }
        });

        if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

        // Calculate 6 months of expenses
        const monthlyExpenses = (property.expenses || [])
            .filter(e => e.frequency === 'monthly')
            .reduce((sum, e) => sum + e.amount, 0);

        // Add annualized expenses / 12 for rough estimate of others
        const annualExpenses = (property.expenses || [])
            .filter(e => e.frequency === 'annual')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalMonthlyBurn = monthlyExpenses + (annualExpenses / 12);
        const recommendedReserves = totalMonthlyBurn * 6;

        // Update financials
        const financials = await prisma.propertyFinancials.upsert({
            where: { propertyId: id },
            update: {
                currentReserves: recommendedReserves
            },
            create: {
                propertyId: id,
                currentReserves: recommendedReserves,
            }
        });

        return NextResponse.json({
            success: true,
            recommendedReserves,
            currentReserves: financials.currentReserves
        });

    } catch (error) {
        console.error('Error calculating reserves:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
