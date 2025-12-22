import { NextRequest, NextResponse } from 'next/server';
import { getPropertyMarketAnalysis } from '@/lib/services/market-data-service';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id: propertyId } = params;

        // Get property details
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                tenants: {
                    where: { status: 'active' },
                    take: 1
                }
            }
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Get market analysis
        const zipCode = property.zipCode || '16801'; // Default for demo
        const bedrooms = 3; // Default, should come from property/tenant data
        const bathrooms = 2;
        const squareFeet = property.squareFeet || 1500;
        const currentRent = property.tenants[0]?.rentAmount || undefined;

        const marketAnalysis = await getPropertyMarketAnalysis(
            zipCode,
            bedrooms,
            bathrooms,
            squareFeet,
            currentRent
        );

        // Market Snapshot saving disabled (Model not implemented)

        return NextResponse.json({
            success: true,
            data: marketAnalysis
        });
    } catch (error) {
        console.error('Error fetching market analysis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market analysis' },
            { status: 500 }
        );
    }
}
