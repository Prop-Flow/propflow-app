import { z } from 'zod';

export const userRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().optional(),
    propertyId: z.string().min(1, "Property ID is required"),
    apartmentNumber: z.string().optional(),
    occupants: z.number().int().min(1).optional().default(1),
});

export const inviteManagerSchema = z.object({
    email: z.string().email("Invalid email address"),
    propertyId: z.string().optional(), // Optional context
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type InviteManagerInput = z.infer<typeof inviteManagerSchema>;
