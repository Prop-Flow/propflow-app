/**
 * Tenant Data Access Layer (DAL)
 * Centralizes tenant data access with built-in authorization
 */

import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../errors/custom-errors';
import { getTenantFieldsForRole } from '../auth/rbac';
import type { SessionUser } from '../auth/session';

/**
 * Get tenant by ID with role-based access control
 */
export async function getTenantForUser(tenantId: string, user: SessionUser) {
    const tenant = await prisma.tenant.findFirst({
        where: {
            id: tenantId,
            OR: [
                // Tenant can access their own data
                { userId: user.id },
                // Owner can access tenants in their properties
                ...(user.role === 'owner' ? [{ property: { ownerUserId: user.id } }] : []),
                // Manager can access tenants in managed properties
                ...(user.role === 'property_manager' ? [{ property: { managers: { some: { id: user.id } } } }] : []),
            ],
        },
        select: getTenantFieldsForRole(user.role),
    });

    if (!tenant) {
        throw new NotFoundError('Tenant not found or access denied');
    }

    return tenant;
}

/**
 * Get all tenants for user
 * Filters based on role and property access
 */
export async function getTenantsForUser(user: SessionUser, filters?: {
    propertyId?: string;
    status?: string;
}) {
    const where: Prisma.TenantWhereInput = {};

    // Apply role-based filtering
    if (user.role === 'owner') {
        where.property = { ownerUserId: user.id };
    } else if (user.role === 'property_manager') {
        where.property = { managers: { some: { id: user.id } } };
    } else if (user.role === 'tenant') {
        where.userId = user.id;
    } else {
        throw new ForbiddenError('Invalid role for tenant access');
    }

    // Apply additional filters
    if (filters?.propertyId) {
        where.propertyId = filters.propertyId;
    }
    if (filters?.status) {
        where.status = filters.status;
    }

    const tenants = await prisma.tenant.findMany({
        where,
        select: getTenantFieldsForRole(user.role),
        orderBy: { createdAt: 'desc' },
    });

    return tenants;
}

/**
 * Create tenant (owner/manager only)
 */
export async function createTenant(data: Prisma.TenantUncheckedCreateInput, user: SessionUser) {
    if (user.role === 'tenant') {
        throw new ForbiddenError('Tenants cannot create other tenants');
    }

    // Verify user has access to the property
    const property = await prisma.property.findFirst({
        where: {
            id: data.propertyId,
            OR: [
                { ownerUserId: user.id },
                { managers: { some: { id: user.id } } },
            ],
        },
    });

    if (!property) {
        throw new ForbiddenError('You do not have access to this property');
    }

    const tenant = await prisma.tenant.create({
        data,
        select: getTenantFieldsForRole(user.role),
    });

    return tenant;
}

/**
 * Update tenant (owner/manager only, or tenant updating own data)
 */
export async function updateTenant(tenantId: string, data: Prisma.TenantUncheckedUpdateInput, user: SessionUser) {
    const existing = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            userId: true,
            property: {
                select: {
                    ownerUserId: true,
                    managers: { select: { id: true } },
                },
            },
        },
    });

    if (!existing) {
        throw new NotFoundError('Tenant not found');
    }

    // Check permissions
    const canUpdate =
        existing.userId === user.id || // Tenant updating own data
        existing.property.ownerUserId === user.id || // Owner
        existing.property.managers.some(m => m.id === user.id); // Manager

    if (!canUpdate) {
        throw new ForbiddenError('You do not have permission to update this tenant');
    }

    // Tenants can only update limited fields
    if (user.role === 'tenant') {
        const updateData: Prisma.TenantUpdateInput = {};
        // Explicitly check and assign allowed fields to avoid dynamic key index errors for Prisma types
        if ('phone' in data && typeof data.phone === 'string') updateData.phone = data.phone;
        if ('email' in data && typeof data.email === 'string') updateData.email = data.email;

        // Only use the filtered updateData
        data = updateData;
    }

    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data,
        select: getTenantFieldsForRole(user.role),
    });

    return tenant;
}

/**
 * Get pending tenants (owner/manager only)
 */
export async function getPendingTenantsForUser(user: SessionUser) {
    if (user.role === 'tenant') {
        throw new ForbiddenError('Tenants cannot view pending tenant list');
    }

    const where: Prisma.TenantWhereInput = { status: 'pending' };

    if (user.role === 'owner') {
        where.property = { ownerUserId: user.id };
    } else if (user.role === 'property_manager') {
        where.property = { managers: { some: { id: user.id } } };
    }

    const tenants = await prisma.tenant.findMany({
        where,
        select: getTenantFieldsForRole(user.role),
        orderBy: { createdAt: 'desc' },
    });

    return tenants;
}
