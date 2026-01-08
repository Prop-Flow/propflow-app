import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
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
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Firestore Transaction to create User and Tenant profile
        const userId = await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc();
            const tenantRef = db.collection('tenants').doc();

            const userData = {
                id: userRef.id,
                email,
                firstName,
                lastName,
                phone: phone || null,
                role: 'tenant',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const tenantData = {
                id: tenantRef.id,
                propertyId,
                userId: userRef.id,
                name: `${firstName} ${lastName}`,
                email,
                phone: phone || null,
                status: 'pending',
                apartmentNumber: apartmentNumber || null,
                numberOfOccupants: occupants || 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            transaction.set(userRef, userData);
            transaction.set(tenantRef, tenantData);

            return userRef.id;
        });

        return NextResponse.json({
            success: true,
            message: 'Registration successful. Waiting for approval.',
            userId: userId
        });

    } catch (error) {
        console.error('Error registering tenant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
