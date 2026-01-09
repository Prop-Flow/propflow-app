import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { z } from 'zod';

// Input validation schema
const registrationSchema = z.object({
    propertyId: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    apartmentNumber: z.string().optional(),
    occupants: z.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registrationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: validation.error.errors },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Verify property exists
        const propertyDoc = await db.collection('properties').doc(data.propertyId).get();
        if (!propertyDoc.exists) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Create pending tenant document
        const tenantData = {
            propertyId: data.propertyId,
            name: `${data.firstName} ${data.lastName}`.trim(),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            apartmentNumber: data.apartmentNumber || null,
            numberOfOccupants: data.occupants,
            status: 'pending', // Key: Must be pending approval
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'onboarding_portal'
        };

        const docRef = await db.collection('tenants').add(tenantData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: 'Registration submitted for approval'
        }, { status: 201 });

    } catch (error) {
        console.error('Error registering tenant:', error);
        return NextResponse.json(
            { error: 'Failed to process registration' },
            { status: 500 }
        );
    }
}
