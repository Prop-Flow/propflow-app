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
    console.log('🔵 registerUser called');
    console.log('🔵 Form data:', {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        role: formData.get('role'),
        phone: formData.get('phone'),
    });

    const validatedFields = registerSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        console.error('Validation failed:', JSON.stringify(validatedFields.error.flatten(), null, 2));
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { firstName, lastName, email, password, role, phone } = validatedFields.data;
    console.log('🟢 Validation passed. Role:', role);

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('🔴 User already exists:', email);
            return {
                success: false,
                errors: {
                    email: ['Email already exists'],
                },
                message: 'Email already exists. Please use a different email or try logging in.',
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Map role to database format (uppercase)
        let dbRole: string;
        if (role === 'manager') {
            dbRole = 'PROPERTY_MANAGER';
        } else if (role === 'owner') {
            dbRole = 'OWNER';
        } else {
            dbRole = 'TENANT';
        }

        console.log('🟢 Creating user with role:', dbRole);

        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash: hashedPassword,
                role: dbRole,
                phone,
                name: `${firstName} ${lastName}`,
            },
        });

        console.log('🟢 User created successfully');
        return {
            success: true,
            message: 'User registered successfully',
        };

    } catch (error) {
        console.error('🔴 Registration error details:', error);
        return {
            success: false,
            message: `Database Error: Failed to Register. Details: ${(error as Error).message}`,
        };
    }
}
