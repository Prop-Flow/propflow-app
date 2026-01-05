import { z } from 'zod';

// Tenant response schema
export const tenantResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    status: z.enum(['active', 'pending', 'inactive']),
    propertyId: z.string(),
    apartmentNumber: z.string().nullable(),
    leaseStartDate: z.date().nullable(),
    leaseEndDate: z.date().nullable(),
    rentAmount: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    property: z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
    }).optional(),
    _count: z.object({
        // Other relations removed
    }).optional(),
});

export const pendingTenantSchema = tenantResponseSchema.extend({
    status: z.literal('pending'),
    property: z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
    }),
});

export type TenantResponse = z.infer<typeof tenantResponseSchema>;
export type PendingTenant = z.infer<typeof pendingTenantSchema>;

// API response wrappers
export const tenantsListResponseSchema = z.object({
    tenants: z.array(tenantResponseSchema),
});

export const pendingTenantsResponseSchema = z.array(pendingTenantSchema);
