import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tenantSchema } from '@/lib/utils/validation';
import { createRequiredDocuments } from '@/lib/documents/tracker';
import { getRequiredDocuments } from '@/lib/compliance/rules-engine';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        const where = propertyId ? { propertyId } : {};

        const tenants = await prisma.tenant.findMany({
            where,
            include: {
                property: true,
                _count: {
                    select: {
                        documents: true,
                        communicationLogs: true,
                        complianceItems: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ tenants });
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = tenantSchema.parse(body);

        // Get property to determine required documents
        const property = await prisma.property.findUnique({
            where: { id: validatedData.propertyId },
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        const tenant = await prisma.tenant.create({
            data: {
                ...validatedData,
                leaseStartDate: validatedData.leaseStartDate
                    ? new Date(validatedData.leaseStartDate)
                    : null,
                leaseEndDate: validatedData.leaseEndDate
                    ? new Date(validatedData.leaseEndDate)
                    : null,
            },
        });

        // Create required documents based on property type
        const requiredDocs = getRequiredDocuments(property.type || 'residential');
        await createRequiredDocuments(tenant.id, requiredDocs);

        return NextResponse.json({ tenant }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating tenant:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create tenant' },
            { status: 400 }
        );
    }
}
