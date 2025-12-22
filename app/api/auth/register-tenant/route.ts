import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userRegisterSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Zod Validation
        const result = userRegisterSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { propertyId, firstName, lastName, email, phone, apartmentNumber, occupants } = result.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Transaction to create User and Tenant profile
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    phone,
                    role: 'TENANT',
                    // In a real app, send welcome email with password reset link
                }
            });

            // 2. Create Tenant Profile (Status: Pending)
            const tenant = await tx.tenant.create({
                data: {
                    propertyId,
                    userId: user.id,
                    name: `${firstName} ${lastName}`,
                    email,
                    phone,
                    status: 'pending',
                    apartmentNumber,
                    numberOfOccupants: occupants
                }
            });

            return { user, tenant };
        });

        return NextResponse.json({
            success: true,
            message: 'Registration successful. Waiting for approval.',
            userId: transactionResult.user.id
        });

    } catch (error) {
        console.error('Error registering tenant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
