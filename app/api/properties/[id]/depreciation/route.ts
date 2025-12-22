import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getPropertyForUser } from '@/lib/dal/properties';
import { sanitizeError, logError, ForbiddenError, AppError } from '@/lib/errors/custom-errors';
import {
    calculateDepreciation,
    generateDepreciationSchedule,
    getCurrentYearDepreciation,
    getAccumulatedDepreciation,
    estimateTaxSavings,
} from '@/lib/tax/depreciation-calculator';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Input validation schema
const depreciationInputSchema = z.object({
    purchasePrice: z.number().positive('Purchase price must be greater than zero'),
    purchaseDate: z.string().or(z.date()),
    assessedLandValue: z.number().nonnegative('Land value cannot be negative'),
    assessedBuildingValue: z.number().positive('Building value must be greater than zero'),
    taxAssessmentYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
});

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getSessionUser(request);
        const { id } = await props.params;

        // Verify user has access to this property (DAL handles authorization)
        await getPropertyForUser(id, user);

        // Only owners and managers can access financial/depreciation data
        if (user.role === 'tenant') {
            throw new ForbiddenError('Tenants cannot access depreciation data');
        }

        // Check if property has depreciation data
        // We will check this after fetching the full object with financial fields


        // For type safety, we need to fetch the full property with depreciation fields
        const fullProperty = await prisma.property.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                purchasePrice: true,
                purchaseDate: true,
            },
        });

        if (!fullProperty?.purchasePrice || !fullProperty?.purchaseDate) {
            return NextResponse.json({
                hasData: false,
                message: 'Property depreciation data not configured',
            });
        }

        // Calculate depreciation
        const result = calculateDepreciation({
            purchasePrice: Number(fullProperty.purchasePrice),
            purchaseDate: fullProperty.purchaseDate,
            assessedLandValue: 0, // TODO: Add these fields
            assessedBuildingValue: Number(fullProperty.purchasePrice), // Temporary
        });

        // Generate schedule
        const schedule = generateDepreciationSchedule({
            purchasePrice: Number(fullProperty.purchasePrice),
            purchaseDate: fullProperty.purchaseDate,
            assessedLandValue: 0,
            assessedBuildingValue: Number(fullProperty.purchasePrice),
        });

        const currentYear = new Date().getFullYear();
        const currentYearDepreciation = getCurrentYearDepreciation({
            purchasePrice: Number(fullProperty.purchasePrice),
            purchaseDate: fullProperty.purchaseDate,
            assessedLandValue: 0,
            assessedBuildingValue: Number(fullProperty.purchasePrice),
        }, currentYear);

        const accumulated = getAccumulatedDepreciation({
            purchasePrice: Number(fullProperty.purchasePrice),
            purchaseDate: fullProperty.purchaseDate,
            assessedLandValue: 0,
            assessedBuildingValue: Number(fullProperty.purchasePrice),
        }, currentYear);

        const estimatedSavings = estimateTaxSavings(result.annualDepreciation, 0.24);

        return NextResponse.json({
            hasData: true,
            property: {
                id: fullProperty.id,
                name: fullProperty.name,
                purchasePrice: Number(fullProperty.purchasePrice),
                purchaseDate: fullProperty.purchaseDate,
            },
            depreciation: result,
            schedule,
            currentYear: {
                year: currentYear,
                depreciation: currentYearDepreciation,
                accumulated,
                estimatedTaxSavings: estimatedSavings,
            },
        });
    } catch (error) {
        logError(error, 'GET /api/properties/[id]/depreciation');
        const sanitized = sanitizeError(error);
        const status = error instanceof AppError ? error.statusCode : 500;
        return NextResponse.json(sanitized, { status });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getSessionUser(request);
        const { id } = await params;

        // Verify user has access to this property
        await getPropertyForUser(id, user);

        // Only owners and managers can modify financial data
        if (user.role === 'tenant') {
            throw new ForbiddenError('Tenants cannot modify depreciation data');
        }

        // Parse and validate input
        const body = await request.json();
        const validated = depreciationInputSchema.parse(body);

        // Calculate depreciation
        const result = calculateDepreciation({
            purchasePrice: validated.purchasePrice,
            purchaseDate: new Date(validated.purchaseDate),
            assessedLandValue: validated.assessedLandValue,
            assessedBuildingValue: validated.assessedBuildingValue,
        });

        // Update property with depreciation data
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                purchasePrice: validated.purchasePrice,
                purchaseDate: new Date(validated.purchaseDate),
            },
        });

        return NextResponse.json({
            success: true,
            property: updatedProperty,
            depreciation: result,
        });
    } catch (error) {
        logError(error, 'POST /api/properties/[id]/depreciation');

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        const sanitized = sanitizeError(error);
        const status = error instanceof AppError ? error.statusCode : 500;
        return NextResponse.json(sanitized, { status });
    }
}
