import { z } from 'zod';

// Property validation schemas
export const propertySchema = z.object({
    name: z.string().min(1, 'Property name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    type: z.string().optional(),
    units: z.number().int().positive().default(1),
    ownerName: z.string().optional(),
    ownerEmail: z.string().email().optional().or(z.literal('')),
    ownerPhone: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

// Tenant validation schemas
export const tenantSchema = z.object({
    propertyId: z.string().min(1, 'Property is required'),
    name: z.string().min(1, 'Tenant name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    leaseStartDate: z.string().or(z.date()).optional(),
    leaseEndDate: z.string().or(z.date()).optional(),
    rentAmount: z.number().positive().optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export type TenantInput = z.infer<typeof tenantSchema>;
