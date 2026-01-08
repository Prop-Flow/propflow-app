'use server';

import { db } from '@/lib/services/firebase-admin';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['tenant', 'owner', 'manager']),
    phone: z.string().optional(),
});

export type RegisterState = {
    errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
        phone?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    console.log('🔵 registerUser called');

    const validatedFields = registerSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { firstName, lastName, email, password, role, phone } = validatedFields.data;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (!userSnapshot.empty) {
            return {
                success: false,
                errors: {
                    email: ['Email already exists'],
                },
                message: 'Email already exists. Please use a different email or try logging in.',
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Map role to database format
        const dbRole = role === 'manager' ? 'property_manager' : role.toLowerCase();

        const userRef = db.collection('users').doc();
        await userRef.set({
            id: userRef.id,
            firstName,
            lastName,
            email,
            passwordHash: hashedPassword,
            role: dbRole,
            phone: phone || null,
            name: `${firstName} ${lastName}`,
            createdAt: new Date(),
        });

        return {
            success: true,
            message: 'User registered successfully',
        };

    } catch (error) {
        console.error('🔴 Registration error:', error);
        return {
            success: false,
            message: `Database Error: Failed to Register.`,
        };
    }
}
