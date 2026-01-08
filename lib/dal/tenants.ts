/**
 * Tenant Data Access Layer (DAL)
 * Centralizes tenant data access with built-in authorization
 */

import { db } from '../services/firebase-admin';
import { ForbiddenError, NotFoundError } from '../errors/custom-errors';
import { getAllowedTenantFields, filterFields } from '../auth/rbac';
import type { SessionUser } from '../auth/session';

/**
 * Get tenant by ID with role-based access control
 */
export async function getTenantForUser(tenantId: string, user: SessionUser) {
    const doc = await db.collection('tenants').doc(tenantId).get();

    if (!doc.exists) {
        throw new NotFoundError('Tenant not found');
    }

    const data = doc.data()!;
    const propertyDoc = await db.collection('properties').doc(data.propertyId).get();
    const propertyData = propertyDoc.exists ? propertyDoc.data() : null;

    const hasAccess =
        data.userId === user.id ||
        (propertyData && (
            propertyData.ownerUserId === user.id ||
            (propertyData.managers || []).includes(user.id)
        ));

    if (!hasAccess) {
        throw new ForbiddenError('Access denied to this tenant');
    }

    // Apply role-based field filtering
    const allowedFields = getAllowedTenantFields(user.role);
    const filteredData = { id: doc.id, ...filterFields(data as Record<string, unknown>, allowedFields) };

    return filteredData;
}

/**
 * Get all tenants for user
 * Filters based on role and property access
 */
export async function getTenantsForUser(user: SessionUser, filters?: {
    propertyId?: string;
    status?: string;
}) {
    let tenantQuery: FirebaseFirestore.Query = db.collection('tenants');

    if (user.role === 'tenant') {
        tenantQuery = tenantQuery.where('userId', '==', user.id);
    } else {
        // Owner or Manager: Need to filter by property access
        let propertyIds: string[] = [];
        const propertyQuery = user.role === 'owner'
            ? db.collection('properties').where('ownerUserId', '==', user.id)
            : db.collection('properties').where('managers', 'array-contains', user.id);

        const propertySnapshot = await propertyQuery.get();
        propertyIds = propertySnapshot.docs.map(doc => doc.id);

        if (propertyIds.length === 0) return [];

        // Handle propertyId filter
        if (filters?.propertyId) {
            if (propertyIds.includes(filters.propertyId)) {
                tenantQuery = tenantQuery.where('propertyId', '==', filters.propertyId);
            } else {
                return []; // No access to requested property
            }
        } else {
            // Filter by all accessible properties (limit 30 for 'in' operator)
            const chunkedIds = propertyIds.slice(0, 30);
            tenantQuery = tenantQuery.where('propertyId', 'in', chunkedIds);
        }
    }

    if (filters?.status) {
        tenantQuery = tenantQuery.where('status', '==', filters.status);
    }

    const snapshot = await tenantQuery.orderBy('createdAt', 'desc').get();
    const allowedFields = getAllowedTenantFields(user.role);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...filterFields(data as Record<string, unknown>, allowedFields) };
    });
}

/**
 * Create tenant (owner/manager only)
 */
export async function createTenant(data: Record<string, unknown>, user: SessionUser) {
    if (user.role === 'tenant') {
        throw new ForbiddenError('Tenants cannot create other tenants');
    }

    // Verify user has access to the property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyDoc = await db.collection('properties').doc((data as any).propertyId).get();
    if (!propertyDoc.exists) throw new NotFoundError('Property not found');

    const propertyData = propertyDoc.data()!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasAccess = (propertyData as any).ownerUserId === user.id || ((propertyData as any).managers || []).includes(user.id);

    if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this property');
    }

    const tenantData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const docRef = await db.collection('tenants').add(tenantData);
    const doc = await docRef.get();

    return { id: doc.id, ...doc.data() };
}

/**
 * Update tenant (owner/manager only, or tenant updating own data)
 */
export async function updateTenant(tenantId: string, data: Record<string, unknown>, user: SessionUser) {
    const docRef = db.collection('tenants').doc(tenantId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new NotFoundError('Tenant not found');
    }

    const existingData = doc.data()!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyDoc = await db.collection('properties').doc((existingData as any).propertyId).get();
    const propertyData = propertyDoc.exists ? propertyDoc.data() : null;

    // Check permissions
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const canUpdate =
        (existingData as any).userId === user.id || // Tenant updating own data
        (propertyData && (
            (propertyData as any).ownerUserId === user.id ||
            ((propertyData as any).managers || []).includes(user.id)
        ));
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (!canUpdate) {
        throw new ForbiddenError('You do not have permission to update this tenant');
    }

    // Tenants can only update limited fields
    let finalUpdateData = data;
    if (user.role === 'tenant') {
        finalUpdateData = {};
        if (data.phone) finalUpdateData.phone = data.phone;
        if (data.email) finalUpdateData.email = data.email;
    }

    await docRef.update({
        ...finalUpdateData,
        updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
}

/**
 * Get pending tenants (owner/manager only)
 */
export async function getPendingTenantsForUser(user: SessionUser) {
    return getTenantsForUser(user, { status: 'pending' });
}
