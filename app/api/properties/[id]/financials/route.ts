import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/errors/custom-errors';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await getSessionUser(request); // Verify session but don't store unused var
        const params = await props.params;
        const { id } = params;

        // Fetch property with financial data
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                financials: true,
                expenses: true,
                income: true,
                debts: true,
            }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // Calculate totals
        const totalIncome = (property.income || []).reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = (property.expenses || []).reduce((sum, item) => sum + item.amount, 0);
        const netOperatingIncome = totalIncome - totalExpenses;

        return NextResponse.json({
            income: property.income || [],
            expenses: property.expenses || [],
            debts: property.debts || [],
            currentReserves: property.financials?.currentReserves || 0, // Updated field name
            recommendedReserves: (totalExpenses / 12) * 6, // 6 months of expenses
            totalIncome,
            totalExpenses,
            netOperatingIncome
        });
    } catch (error) {
        console.error('Error fetching financials:', error);
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
