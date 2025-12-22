import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch valuation history
        const valuations = await prisma.propertyValuation.findMany({
            where: { propertyId: id },
            orderBy: { valuationDate: 'desc' },
            take: 1
        });

        const currentValuation = valuations[0];
        const property = await prisma.property.findUnique({
            where: { id },
            select: { purchasePrice: true, purchaseDate: true }
        });

        return NextResponse.json({
            current: currentValuation ? {
                estimatedValue: currentValuation.estimatedValue,
                purchasePrice: property?.purchasePrice,
                totalAppreciation: (currentValuation.estimatedValue || 0) - (property?.purchasePrice || 0),
                appreciationRate: property?.purchasePrice
                    ? (((currentValuation.estimatedValue || 0) - property.purchasePrice) / property.purchasePrice) * 100
                    : 0,
                marketCapRate: 7.5, // Mock market rate
                confidence: 'HIGH'
            } : null,
            history: [] // Implement history fetch if needed
        });

    } catch (error) {
        console.error('Error fetching valuation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Simply return a mock valuation for now or implement logic
        // For reliability, we'll implement a basic cap-rate based valuation

        const property = await prisma.property.findUnique({
            where: { id },
            include: { income: true, expenses: true }
        });

        if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

        // Simple NOI calculation
        const income = (property.income || []).reduce((s, i) => s + i.amount, 0) * 12; // annualized
        const expenses = (property.expenses || []).reduce((s, e) => s + e.amount, 0) * 12;
        const noi = (income * 0.95) - expenses; // 5% vacancy

        const capRate = 0.07; // 7% cap rate
        const estimatedValue = noi / capRate;

        // Save valuation
        const valuation = await prisma.propertyValuation.create({
            data: {
                propertyId: id,
                estimatedValue: estimatedValue,
                source: 'AUTOMATED_VALUATION',
                valuationDate: new Date(),
                confidenceScore: 0.85
            }
        });

        return NextResponse.json(valuation);

    } catch (error) {
        console.error('Error calculating valuation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
