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

        const income = await prisma.propertyIncome.create({
            data: {
                propertyId: id,
                propertyFinancialsId: financials.id,
                source: body.source,
                amount: body.amount,
                frequency: body.frequency,
                description: body.description,
                customSourceName: body.customSourceName,
                dateReceived: new Date()
            }
        });

        return NextResponse.json(income);

    } catch (error) {
        console.error('Error adding income:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
