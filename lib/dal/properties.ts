/**
 * Property Data Access Layer (DAL)
 * Centralizes property data access with built-in authorization
 * Implements OWASP best practice: authorization closest to data
 */

import { db } from '../services/firebase-admin';
import { ForbiddenError, NotFoundError } from '../errors/custom-errors';
import { getAllowedPropertyFields, canAccessProperty, filterFields } from '../auth/rbac';
import type { SessionUser } from '../auth/session';

/**
 * Get property by ID with role-based access control
 * Throws UnauthorizedError if user doesn't have access
 */
export async function getPropertyForUser(propertyId: string, user: SessionUser) {
    const doc = await db.collection('properties').doc(propertyId).get();

    if (!doc.exists) {
        throw new NotFoundError('Property not found');
    }

    const data = doc.data()!;
    // Combine managers array and individual manager checks if needed
    const managers = data.managers || [];
    const tenants = data.tenants || [];

    const hasAccess =
        data.ownerUserId === user.id ||
        managers.includes(user.id) ||
        (user.role === 'tenant' && tenants.includes(user.id));

    if (!hasAccess) {
        throw new ForbiddenError('Access denied to this property');
    }

    // Apply role-based field filtering
    const allowedFields = getAllowedPropertyFields(user.role);
    const filteredData = { id: doc.id, ...filterFields(data as Record<string, unknown>, allowedFields) };

    return filteredData;
}

/**
 * Get all properties for user
 * Returns only properties the user has access to
 */
export async function getPropertiesForUser(user: SessionUser) {
    let query: FirebaseFirestore.Query = db.collection('properties');

    if (user.role === 'owner') {
        query = query.where('ownerUserId', '==', user.id);
    } else if (user.role === 'property_manager') {
        query = query.where('managers', 'array-contains', user.id);
    } else if (user.role === 'tenant') {
        query = query.where('tenants', 'array-contains', user.id);
    } else {
        return [];
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const allowedFields = getAllowedPropertyFields(user.role);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...filterFields(data as Record<string, unknown>, allowedFields) };
    });
}

/**
 * Create property (owner only)
 */
export async function createProperty(data: Record<string, unknown>, user: SessionUser) {
    if (user.role !== 'owner') {
        throw new ForbiddenError('Only owners can create properties');
    }

    const propertyData = {
        ...data,
        ownerUserId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const docRef = await db.collection('properties').add(propertyData);
    const doc = await docRef.get();

    return { id: doc.id, ...doc.data() };
}

/**
 * Update property (owner/manager only)
 */
export async function updateProperty(propertyId: string, data: Record<string, unknown>, user: SessionUser) {
    const docRef = db.collection('properties').doc(propertyId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new NotFoundError('Property not found');
    }

    const existingData = doc.data()!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!canAccessProperty(existingData as any, user.id, user.role)) {
        throw new ForbiddenError('You do not have permission to update this property');
    }

    await docRef.update({
        ...data,
        updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
}

/**
 * Delete property (owner only)
 */
export async function deleteProperty(propertyId: string, user: SessionUser) {
    if (user.role !== 'owner') {
        throw new ForbiddenError('Only owners can delete properties');
    }

    const docRef = db.collection('properties').doc(propertyId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new NotFoundError('Property not found');
    }

    const data = doc.data()!;
    if (data.ownerUserId !== user.id) {
        throw new ForbiddenError('You can only delete your own properties');
    }

    await docRef.delete();

    return { success: true };
}
