import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Ensure financials exist
        let financials = await prisma.propertyFinancials.findUnique({
            where: { propertyId: id }
        });

        if (!financials) {
            financials = await prisma.propertyFinancials.create({
                data: { propertyId: id }
            });
        }

        const expense = await prisma.propertyExpense.create({
            data: {
                propertyId: id,
                propertyFinancialsId: financials.id,
                category: body.category,
                amount: body.amount,
                frequency: body.frequency,
                description: body.description,
                customCategoryName: body.customCategoryName,
                dueDate: new Date()
            }
        });

        return NextResponse.json(expense);

    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
