/**
 * Role-Based Access Control (RBAC)
 * Defines what data each role can access
 */

import type { Prisma } from '@prisma/client';

/**
 * Get property fields based on user role
 * Implements principle of least privilege
 */
export function getPropertyFieldsForRole(role: string): Prisma.PropertySelect {
    const baseFields: Prisma.PropertySelect = {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        units: true,
        createdAt: true,
        updatedAt: true,
    };

    // Owner and Manager: Full access to all fields
    if (role === 'owner' || role === 'property_manager') {
        return {
            ...baseFields,
            squareFeet: true,
            yearBuilt: true,
            purchasePrice: true,
            purchaseDate: true,
            buildingCode: true,
            ownerUserId: true,
            // Include financial data
            financials: true,
            valuations: true,
            projection: true,
            _count: {
                select: {
                    tenants: true,
                    complianceItems: true,
                },
            },
        };
    }

    // Tenant: Limited access - no financial data
    if (role === 'tenant') {
        return {
            ...baseFields,
            // Tenants can see basic property info only
            // NO financial data, NO purchase price, NO owner info
        };
    }

    // Default: Minimal access
    return baseFields;
}

/**
 * Get tenant fields based on user role
 */
export function getTenantFieldsForRole(role: string): Prisma.TenantSelect {
    const baseFields: Prisma.TenantSelect = {
        id: true,
        name: true,
        status: true,
        apartmentNumber: true,
        createdAt: true,
    };

    // Owner and Manager: Full access
    if (role === 'owner' || role === 'property_manager') {
        return {
            ...baseFields,
            email: true,
            phone: true,
            leaseStartDate: true,
            leaseEndDate: true,
            rentAmount: true,
            squareFootage: true,
            numberOfOccupants: true,
            property: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                },
            },
            _count: {
                select: {
                    documents: true,
                    communicationLogs: true,
                    complianceItems: true,
                },
            },
        };
    }

    // Tenant: Can only see their own data
    if (role === 'tenant') {
        return {
            ...baseFields,
            email: true,
            phone: true,
            leaseStartDate: true,
            leaseEndDate: true,
            rentAmount: true,
            property: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                },
            },
        };
    }

    return baseFields;
}

/**
 * Get financial fields based on user role
 * Financial data is HIGHLY SENSITIVE
 */
export function getFinancialFieldsForRole(role: string): Prisma.PropertyFinancialsSelect | null {
    // Only owners and managers can access financial data
    if (role === 'owner' || role === 'property_manager') {
        return {
            id: true,
            propertyId: true,
            currentReserves: true,
            recommendedReserves: true,
            vacancyRate: true,
            estimatedVacancyLoss: true,
            totalMonthlyIncome: true,
            totalMonthlyExpenses: true,
            monthlyNetIncome: true,
            operatingReserve: true,
            expenses: true,
            debts: true,
            income: true,
            createdAt: true,
            updatedAt: true,
        };
    }

    // Tenants and others: NO ACCESS
    return null;
}

/**
 * Check if user can access property
 */
export function canAccessProperty(
    property: { ownerUserId: string | null; managers?: { id: string }[] },
    userId: string,
    role: string
): boolean {
    // Owner access
    if (property.ownerUserId === userId) return true;

    // Manager access
    if (role === 'property_manager' && property.managers?.some(m => m.id === userId)) {
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
    // Tenant can access their own data
    if (tenant.userId === userId) return true;

    // Owner/Manager can access tenants in their properties
    if (role === 'owner' || role === 'property_manager') {
        // Would need to verify property ownership here
        return true;
    }

    return false;
}
