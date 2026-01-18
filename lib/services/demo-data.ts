/**
 * Client-Side Demo Data Provider
 * 
 * Provides mock data for demo mode without any Firestore reads/writes.
 * All data is returned in-memory for the demo@propflow.com account.
 */

import { MVP_DEMO_EMAIL } from '@/lib/config/demo';

/**
 * Mock property data for The Rise at State College
 */
export const MOCK_PROPERTY = {
    id: 'demo_property_rise_state_college',
    name: 'The Rise at State College LLC',
    address: '532 E College Ave',
    city: 'State College',
    state: 'PA',
    zipCode: '16801',
    type: 'MULTI_FAMILY',
    units: 12,
    status: 'ACTIVE',
    yearBuilt: 2018,
    propertyManager: 'Michael Chen',
    purchasePrice: 2800000,
    currentValue: 3200000,
    ownerUserId: 'demo_user_propflow_2026',
    createdAt: new Date('2025-08-01T00:00:00Z'),
    updatedAt: new Date('2025-08-01T00:00:00Z'),
    financials: {
        monthlyIncome: 6125,
        monthlyExpenses: 2450,
        occupancyRate: 42,
    },
};

/**
 * Mock tenant data
 */
export const MOCK_TENANTS = [
    {
        id: 'demo_tenant_priya_patel',
        propertyId: MOCK_PROPERTY.id,
        firstName: 'Priya',
        lastName: 'Patel',
        name: 'Priya Patel',
        email: 'priya.patel@psu.edu',
        phone: '(814) 555-0123',
        apartmentNumber: '1203',
        rentAmount: 1625,
        status: 'ACTIVE',
        specialNotes: 'Graduate student floor - PhD Candidate, Materials Science',
        parking: 'Space A-95 (Underground, EV charging)',
        vehicle: 'Tesla Model 3',
        insurance: 'Liberty Mutual (LM-8472-PP)',
        guarantor: 'Raj Patel (Spouse)',
        createdAt: new Date('2025-08-15T00:00:00Z'),
        updatedAt: new Date('2025-08-15T00:00:00Z'),
    },
    {
        id: 'demo_tenant_marcus_thompson',
        propertyId: MOCK_PROPERTY.id,
        firstName: 'Marcus',
        lastName: 'Thompson',
        name: 'Marcus Thompson',
        email: 'marcus.thompson@psu.edu',
        phone: '(814) 555-0124',
        apartmentNumber: '823',
        rentAmount: 1330, // 1295 + 35 pet rent
        status: 'ACTIVE',
        specialNotes: 'Pet: Shadow (Black cat, 12 lbs)',
        parking: 'Space B-23 (Underground)',
        vehicle: '2020 Toyota Camry (Blue, HBN-7392)',
        insurance: 'Allstate (482-MT-9471)',
        guarantor: 'David Thompson (Father)',
        createdAt: new Date('2025-08-15T00:00:00Z'),
        updatedAt: new Date('2025-08-15T00:00:00Z'),
    },
    {
        id: 'demo_tenant_emily_rodriguez',
        propertyId: MOCK_PROPERTY.id,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@psu.edu',
        phone: '(814) 555-0125',
        apartmentNumber: '407',
        rentAmount: 1485,
        status: 'ACTIVE',
        specialNotes: 'No pets',
        parking: 'Space A-47 (Underground)',
        vehicle: '2021 Honda Civic (Silver, KXY-4821)',
        insurance: 'State Farm (75-B9-K472-8)',
        guarantor: 'Maria Rodriguez (Mother)',
        createdAt: new Date('2025-08-15T00:00:00Z'),
        updatedAt: new Date('2025-08-15T00:00:00Z'),
    },
    {
        id: 'demo_tenant_alexander_patterson',
        propertyId: MOCK_PROPERTY.id,
        firstName: 'Alexander',
        lastName: 'Patterson',
        name: 'Alexander Patterson',
        email: 'alexander.patterson@psu.edu',
        phone: '(814) 555-0126',
        apartmentNumber: '614',
        rentAmount: 860, // 785 + 75 parking
        status: 'ACTIVE',
        specialNotes: '3BR/3BA Shared - Bedroom 1 (Individual lease)',
        parking: 'Space B-45 + B-46 (Additional $75/month)',
        vehicle: '2019 Ford F-150 (Black, MKT-5621)',
        insurance: 'State Farm (84-AP-6621)',
        guarantor: 'Robert Patterson (Father)',
        createdAt: new Date('2025-08-15T00:00:00Z'),
        updatedAt: new Date('2025-08-15T00:00:00Z'),
    },
    {
        id: 'demo_tenant_sarah_chen',
        propertyId: MOCK_PROPERTY.id,
        firstName: 'Sarah',
        lastName: 'Chen',
        name: 'Sarah Chen',
        email: 'sarah.chen@psu.edu',
        phone: '(814) 555-0127',
        apartmentNumber: '1105',
        rentAmount: 875,
        status: 'ACTIVE',
        specialNotes: '2BR/2BA Shared - Bedroom 1 (Individual lease)',
        parking: 'Space A-91 (Underground, shared with unit)',
        vehicle: '2022 Mazda CX-5 (Red, PLM-8273)',
        insurance: 'Geico (7291-SC-4482)',
        guarantor: 'Linda Chen (Mother)',
        createdAt: new Date('2025-08-15T00:00:00Z'),
        updatedAt: new Date('2025-08-15T00:00:00Z'),
    },
];

/**
 * Mock lease data
 */
export const MOCK_LEASES = [
    {
        id: 'demo_lease_priya_patel',
        propertyId: MOCK_PROPERTY.id,
        tenantId: 'demo_tenant_priya_patel',
        unitNumber: '1203',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-07-31'),
        monthlyRent: 1625,
        petRent: 0,
        additionalFees: 0,
        securityDeposit: 1625,
        petDeposit: 0,
        leaseTerm: 12,
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        createdAt: new Date('2025-08-01T00:00:00Z'),
        updatedAt: new Date('2025-08-01T00:00:00Z'),
    },
    {
        id: 'demo_lease_marcus_thompson',
        propertyId: MOCK_PROPERTY.id,
        tenantId: 'demo_tenant_marcus_thompson',
        unitNumber: '823',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-05-15'),
        monthlyRent: 1295,
        petRent: 35,
        additionalFees: 0,
        securityDeposit: 1295,
        petDeposit: 300,
        leaseTerm: 9,
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        createdAt: new Date('2025-08-01T00:00:00Z'),
        updatedAt: new Date('2025-08-01T00:00:00Z'),
    },
    {
        id: 'demo_lease_emily_rodriguez',
        propertyId: MOCK_PROPERTY.id,
        tenantId: 'demo_tenant_emily_rodriguez',
        unitNumber: '407',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-05-15'),
        monthlyRent: 1485,
        petRent: 0,
        additionalFees: 0,
        securityDeposit: 1485,
        petDeposit: 0,
        leaseTerm: 9,
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        createdAt: new Date('2025-08-01T00:00:00Z'),
        updatedAt: new Date('2025-08-01T00:00:00Z'),
    },
    {
        id: 'demo_lease_alexander_patterson',
        propertyId: MOCK_PROPERTY.id,
        tenantId: 'demo_tenant_alexander_patterson',
        unitNumber: '614',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-05-15'),
        monthlyRent: 785,
        petRent: 0,
        additionalFees: 75,
        securityDeposit: 785,
        petDeposit: 0,
        leaseTerm: 9,
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        createdAt: new Date('2025-08-01T00:00:00Z'),
        updatedAt: new Date('2025-08-01T00:00:00Z'),
    },
    {
        id: 'demo_lease_sarah_chen',
        propertyId: MOCK_PROPERTY.id,
        tenantId: 'demo_tenant_sarah_chen',
        unitNumber: '1105',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2026-07-31'),
        monthlyRent: 875,
        petRent: 0,
        additionalFees: 0,
        securityDeposit: 875,
        petDeposit: 0,
        leaseTerm: 12,
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        createdAt: new Date('2025-08-01T00:00:00Z'),
        updatedAt: new Date('2025-08-01T00:00:00Z'),
    },
];

/**
 * Get mock properties for demo user
 */
export function getMockProperties() {
    return [MOCK_PROPERTY];
}

/**
 * Get mock tenants for demo user
 * @param propertyId - Optional property ID to filter by
 */
export function getMockTenants(propertyId?: string) {
    if (propertyId && propertyId !== MOCK_PROPERTY.id) {
        return [];
    }
    return MOCK_TENANTS;
}

/**
 * Get mock leases for demo user
 * @param propertyId - Optional property ID to filter by
 */
export function getMockLeases(propertyId?: string) {
    if (propertyId && propertyId !== MOCK_PROPERTY.id) {
        return [];
    }
    return MOCK_LEASES;
}

/**
 * Get pre-calculated dashboard stats for demo user
 */
export function getMockStats() {
    const totalProperties = 1;
    const activeTenants = MOCK_TENANTS.filter(t => t.status === 'ACTIVE').length;
    const totalUnits = MOCK_PROPERTY.units;
    const occupancyRate = (activeTenants / totalUnits) * 100;
    const monthlyRevenue = MOCK_TENANTS.reduce((sum, t) => sum + t.rentAmount, 0);

    return {
        totalProperties,
        activeTenants,
        occupancyRate: Math.round(occupancyRate * 10) / 10, // 42.0%
        monthlyRevenue,
        totalUnits,
    };
}

/**
 * Check if a user email should use mock data
 */
export function shouldUseMockData(email?: string): boolean {
    return email === MVP_DEMO_EMAIL;
}
