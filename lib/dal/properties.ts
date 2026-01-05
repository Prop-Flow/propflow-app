/**
 * Property Data Access Layer (DAL)
 * Centralizes property data access with built-in authorization
 * Implements OWASP best practice: authorization closest to data
 */

import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../errors/custom-errors';
import { getPropertyFieldsForRole, canAccessProperty } from '../auth/rbac';
import type { SessionUser } from '../auth/session';

/**
 * Get property by ID with role-based access control
 * Throws UnauthorizedError if user doesn't have access
 */
export async function getPropertyForUser(propertyId: string, user: SessionUser) {
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId,
            OR: [
                { ownerUserId: user.id }, // Owner access
                { managers: { some: { id: user.id } } }, // Manager access
                // Tenants can see basic info only (handled by field selection)
                ...(user.role === 'tenant' ? [{ tenants: { some: { userId: user.id } } }] : []),
            ],
        },
        select: getPropertyFieldsForRole(user.role),
    });

    if (!property) {
        throw new NotFoundError('Property not found or access denied');
    }

    return property;
}

/**
 * Get all properties for user
 * Returns only properties the user has access to
 */
export async function getPropertiesForUser(user: SessionUser) {
    const where = user.role === 'owner'
        ? { ownerUserId: user.id }
        : user.role === 'property_manager'
            ? { managers: { some: { id: user.id } } }
            : user.role === 'tenant'
                ? { tenants: { some: { userId: user.id } } }
                : { id: 'never-match' }; // No access for other roles

    const properties = await prisma.property.findMany({
        where,
        select: getPropertyFieldsForRole(user.role),
        orderBy: { createdAt: 'desc' },
    });

    return properties;
}

/**
 * Create property (owner only)
 */
export async function createProperty(data: Prisma.PropertyUncheckedCreateInput, user: SessionUser) {
    if (user.role !== 'owner') {
        throw new ForbiddenError('Only owners can create properties');
    }

    const property = await prisma.property.create({
        data: {
            ...data,
            ownerUserId: user.id,
        },
        select: getPropertyFieldsForRole(user.role),
    });

    return property;
}

/**
 * Update property (owner/manager only)
 */
export async function updateProperty(propertyId: string, data: Prisma.PropertyUncheckedUpdateInput, user: SessionUser) {
    // Verify access first
    const existing = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
            ownerUserId: true,
            managers: { select: { id: true } },
        },
    });

    if (!existing) {
        throw new NotFoundError('Property not found');
    }

    if (!canAccessProperty(existing, user.id, user.role)) {
        throw new ForbiddenError('You do not have permission to update this property');
    }

    const property = await prisma.property.update({
        where: { id: propertyId },
        data,
        select: getPropertyFieldsForRole(user.role),
    });

    return property;
}

/**
 * Delete property (owner only)
 */
export async function deleteProperty(propertyId: string, user: SessionUser) {
    if (user.role !== 'owner') {
        throw new ForbiddenError('Only owners can delete properties');
    }

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerUserId: true },
    });

    if (!property) {
        throw new NotFoundError('Property not found');
    }

    if (property.ownerUserId !== user.id) {
        throw new ForbiddenError('You can only delete your own properties');
    }

    await prisma.property.delete({
        where: { id: propertyId },
    });

    return { success: true };
}
