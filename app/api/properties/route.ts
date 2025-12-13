import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { propertySchema } from '@/lib/utils/validation';
import { storePropertyInfo } from '@/lib/ai/vector-store';

export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            include: {
                _count: {
                    select: {
                        tenants: true,
                        complianceItems: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = propertySchema.parse(body);

        const property = await prisma.property.create({
            data: validatedData,
        });

        // Store property info in vector database for context
        await storePropertyInfo(property.id, {
            name: property.name,
            address: property.address,
            details: `${property.type || 'Property'} with ${property.units} unit(s)`,
        });

        return NextResponse.json({ property }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating property:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create property' },
            { status: 400 }
        );
    }
}
