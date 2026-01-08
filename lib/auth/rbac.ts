/**
 * Role-Based Access Control (RBAC)
 * Defines what data each role can access
 */

/**
 * Get property fields based on user role
 * Returns an array of field names that the role is allowed to see
 */
export function getAllowedPropertyFields(role: string): string[] {
    const baseFields = [
        'id', 'name', 'address', 'city', 'state', 'zipCode', 'units', 'createdAt', 'updatedAt'
    ];

    if (role === 'owner' || role === 'property_manager') {
        return [
            ...baseFields,
            'squareFeet', 'yearBuilt', 'purchasePrice', 'purchaseDate', 'buildingCode', 'ownerUserId'
        ];
    }

    return baseFields;
}

/**
 * Get tenant fields based on user role
 */
export function getAllowedTenantFields(role: string): string[] {
    const baseFields = [
        'id', 'name', 'status', 'apartmentNumber', 'createdAt'
    ];

    if (role === 'owner' || role === 'property_manager') {
        return [
            ...baseFields,
            'email', 'phone', 'leaseStartDate', 'leaseEndDate', 'rentAmount', 'squareFootage', 'numberOfOccupants', 'propertyId'
        ];
    }

    if (role === 'tenant') {
        return [
            ...baseFields,
            'email', 'phone', 'leaseStartDate', 'leaseEndDate', 'rentAmount', 'propertyId'
        ];
    }

    return baseFields;
}

/**
 * Filter object fields based on allowed list
 */
export function filterFields(data: Record<string, unknown>, allowedFields: string[]): Record<string, unknown> {
    if (!data) return data;
    const filtered: Record<string, unknown> = {};
    allowedFields.forEach(field => {
        if (field in data) {
            filtered[field] = data[field];
        }
    });
    return filtered;
}

/**
 * Check if user can access property
 */
export function canAccessProperty(
    property: { ownerUserId: string | null; managers?: string[] },
    userId: string,
    role: string
): boolean {
    if (property.ownerUserId === userId) return true;
    if (role === 'property_manager' && property.managers?.includes(userId)) {
        return true;
    }
    return false;
}

/**
 * Check if user can access tenant data
 */
export function canAccessTenant(
    tenant: { userId: string | null; propertyId: string },
    userId: string,
    role: string
): boolean {
    if (tenant.userId === userId) return true;
    // Owner/Manager check usually happens at property level
    return role === 'owner' || role === 'property_manager';
}
