'use server';

import { prisma } from '@/lib/prisma';
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
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { firstName, lastName, email, password, role, phone } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return {
                errors: {
                    email: ['Email already exists'],
                },
                message: 'Failed to Register.',
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash: hashedPassword,
                role: role === 'manager' ? 'property_manager' : role, // Map 'manager' to 'property_manager'
                phone,
                name: `${firstName} ${lastName}`,
            },
        });

        return {
            success: true,
            message: 'User registered successfully',
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            message: 'Database Error: Failed to Register.',
        };
    }
}
