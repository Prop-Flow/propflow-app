import { NextRequest, NextResponse } from 'next/server';
import { OptimizePrice, calculatePropertyOccupancy, getOptimizationHistory } from '@/lib/financials/lease-optimizer';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: propertyId } = await params;

        // Get optimization history
        const history = await getOptimizationHistory(propertyId, 5);

        return NextResponse.json({
            success: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: history.map((opt: any) => ({
                ...opt,
                reasoning: JSON.parse(opt.reasoning as string),
                insights: JSON.parse(opt.insights as string)
            }))
        });
    } catch (error) {
        console.error('Error fetching optimization history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch optimization history' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: propertyId } = await params;
        const body = await request.json();

        // Get property details
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                tenants: {
                    where: { status: 'active' }
                }
            }
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Calculate occupancy
        const occupancyRate = await calculatePropertyOccupancy(propertyId);

        // Get tenant data (use first active tenant or defaults)
        const tenant = property.tenants[0];
        const currentRent = tenant?.rentAmount || body.currentRent || 1500;
        const bedrooms = body.bedrooms || 3;
        const bathrooms = body.bathrooms || 2;
        const squareFeet = property.squareFeet || body.squareFeet || 1500;
        const zipCode = property.zipCode || '16801';

        // Generate optimization
        const optimization = await OptimizePrice({
            propertyId,
            tenantId: tenant?.id,
            currentRent,
            zipCode,
            bedrooms,
            bathrooms,
            squareFeet,
            occupancyRate
        });

        return NextResponse.json({
            success: true,
            data: optimization
        });
    } catch (error) {
        console.error('Error generating lease optimization:', error);
        return NextResponse.json(
            { error: 'Failed to generate optimization' },
            { status: 500 }
        );
    }
}
