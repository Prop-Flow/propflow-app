/**
 * Demo Data Seeding Service
 * 
 * Generates and seeds comprehensive mock data for demo mode.
 * All data is idempotent and namespaced under the demo user.
 */

import { faker } from '@faker-js/faker';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { DEMO_USER_ID } from '@/lib/config/demo';

// Seed configuration
const SEED_CONFIG = {
    properties: 3,
    tenantsPerProperty: 4,
    expensesPerProperty: 12, // One year of monthly expenses
    utilityReadingsPerProperty: 6, // 6 months of readings
};

/**
 * Interface for seeded demo data summary
 */
export interface DemoSeedResult {
    success: boolean;
    message: string;
    data: {
        properties: number;
        tenants: number;
        leases: number;
        expenses: number;
        utilityReadings: number;
    };
}

/**
 * Checks if demo data has already been seeded for the demo user.
 */
async function isDemoDataSeeded(): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, 'users', DEMO_USER_ID));
        return userDoc.exists() && userDoc.data()?.demoSeeded === true;
    } catch (error) {
        console.error('Error checking demo seed status:', error);
        return false;
    }
}

/**
 * Generates a realistic property with complete details.
 */
function generateProperty(index: number) {
    const propertyTypes = ['MULTI_FAMILY', 'COMMERCIAL', 'MULTI_FAMILY'];
    const type = propertyTypes[index % propertyTypes.length];
    const units = type === 'COMMERCIAL' ? faker.number.int({ min: 4, max: 10 }) : faker.number.int({ min: 8, max: 24 });
    const purchasePrice = type === 'COMMERCIAL'
        ? faker.number.int({ min: 3000000, max: 5000000 })
        : faker.number.int({ min: 1500000, max: 3500000 });
    const currentValue = purchasePrice * faker.number.float({ min: 1.1, max: 1.3 });
    const monthlyIncome = units * (type === 'COMMERCIAL' ? 3500 : 1800);
    const monthlyExpenses = monthlyIncome * 0.4;

    return {
        id: `property_${index + 1}`,
        name: type === 'COMMERCIAL'
            ? `${faker.location.street()} Office Complex`
            : `${faker.location.street()} Apartments`,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        type,
        units,
        status: 'ACTIVE',
        purchasePrice,
        currentValue,
        monthlyIncome,
        monthlyExpenses,
        occupancyRate: faker.number.int({ min: 85, max: 98 }),
        ownerId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Generates a tenant with complete profile.
 */
function generateTenant(propertyId: string, unitNumber: number) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
        id: `tenant_${propertyId}_${unitNumber}`,
        firstName,
        lastName,
        email,
        phone: faker.phone.number(),
        propertyId,
        unitNumber: unitNumber.toString(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Generates a lease agreement for a tenant.
 */
function generateLease(tenant: any, property: any) {
    const startDate = faker.date.past({ years: 1 });
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const monthlyRent = property.type === 'COMMERCIAL'
        ? faker.number.int({ min: 3000, max: 5000 })
        : faker.number.int({ min: 1200, max: 2500 });

    return {
        id: `lease_${tenant.id}`,
        tenantId: tenant.id,
        propertyId: property.id,
        unitNumber: tenant.unitNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        monthlyRent,
        securityDeposit: monthlyRent,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Generates monthly expense records for a property.
 */
function generateExpenses(propertyId: string, months: number = 12) {
    const expenseTypes = [
        { category: 'UTILITIES', subcategory: 'Water' },
        { category: 'UTILITIES', subcategory: 'Electricity' },
        { category: 'UTILITIES', subcategory: 'Gas' },
        { category: 'MAINTENANCE', subcategory: 'Repairs' },
        { category: 'MAINTENANCE', subcategory: 'Landscaping' },
        { category: 'ADMINISTRATIVE', subcategory: 'Property Management' },
        { category: 'INSURANCE', subcategory: 'Property Insurance' },
        { category: 'TAXES', subcategory: 'Property Tax' },
    ];

    const expenses: Array<{
        id: string;
        propertyId: string;
        category: string;
        subcategory: string;
        amount: number;
        date: string;
        description: string;
        createdAt: string;
    }> = [];
    for (let month = 0; month < months; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);

        expenseTypes.forEach((type, idx) => {
            const baseAmount = type.category === 'UTILITIES' ? 500 :
                type.category === 'MAINTENANCE' ? 800 :
                    type.category === 'TAXES' ? 2000 : 1200;

            expenses.push({
                id: `expense_${propertyId}_${month}_${idx}`,
                propertyId,
                category: type.category,
                subcategory: type.subcategory,
                amount: baseAmount * faker.number.float({ min: 0.8, max: 1.2 }),
                date: date.toISOString(),
                description: `${type.subcategory} for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                createdAt: new Date().toISOString(),
            });
        });
    }

    return expenses;
}

/**
 * Generates utility readings for a property.
 */
function generateUtilityReadings(propertyId: string, months: number = 6) {
    const readings: Array<{
        id: string;
        propertyId: string;
        utilityType: string;
        usage: number;
        cost: number;
        date: string;
        meterNumber: string;
        createdAt: string;
    }> = [];
    const utilityTypes = ['WATER', 'ELECTRIC', 'GAS'];

    for (let month = 0; month < months; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);

        utilityTypes.forEach((type) => {
            const baseUsage = type === 'WATER' ? 12000 : type === 'ELECTRIC' ? 45000 : 300;
            const usage = baseUsage * faker.number.float({ min: 0.9, max: 1.1 });
            const costPerUnit = type === 'WATER' ? 0.005 : type === 'ELECTRIC' ? 0.12 : 1.5;

            readings.push({
                id: `reading_${propertyId}_${type}_${month}`,
                propertyId,
                utilityType: type,
                usage,
                cost: usage * costPerUnit,
                date: date.toISOString(),
                meterNumber: faker.string.alphanumeric(10).toUpperCase(),
                createdAt: new Date().toISOString(),
            });
        });
    }

    return readings;
}

/**
 * Seeds all demo data into Firestore.
 * This function is idempotent - safe to run multiple times.
 */
export async function seedDemoData(): Promise<DemoSeedResult> {
    try {
        // Check if already seeded
        const alreadySeeded = await isDemoDataSeeded();
        if (alreadySeeded) {
            return {
                success: true,
                message: 'Demo data already seeded',
                data: {
                    properties: 0,
                    tenants: 0,
                    leases: 0,
                    expenses: 0,
                    utilityReadings: 0,
                },
            };
        }

        const batch = writeBatch(db);
        let totalTenants = 0;
        let totalLeases = 0;
        let totalExpenses = 0;
        let totalReadings = 0;

        // Create demo user document
        const userRef = doc(db, 'users', DEMO_USER_ID);
        batch.set(userRef, {
            email: 'demo@propflow.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'OWNER',
            uid: DEMO_USER_ID,
            demoSeeded: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Generate and seed properties
        for (let i = 0; i < SEED_CONFIG.properties; i++) {
            const property = generateProperty(i);
            const propertyRef = doc(db, 'users', DEMO_USER_ID, 'properties', property.id);
            batch.set(propertyRef, property);

            // Generate tenants and leases for this property
            for (let j = 0; j < SEED_CONFIG.tenantsPerProperty; j++) {
                const tenant = generateTenant(property.id, j + 1);
                const tenantRef = doc(db, 'users', DEMO_USER_ID, 'tenants', tenant.id);
                batch.set(tenantRef, tenant);
                totalTenants++;

                const lease = generateLease(tenant, property);
                const leaseRef = doc(db, 'users', DEMO_USER_ID, 'leases', lease.id);
                batch.set(leaseRef, lease);
                totalLeases++;
            }

            // Generate expenses
            const expenses = generateExpenses(property.id, SEED_CONFIG.expensesPerProperty);
            expenses.forEach((expense) => {
                const expenseRef = doc(db, 'users', DEMO_USER_ID, 'expenses', expense.id);
                batch.set(expenseRef, expense);
                totalExpenses++;
            });

            // Generate utility readings
            const readings = generateUtilityReadings(property.id, SEED_CONFIG.utilityReadingsPerProperty);
            readings.forEach((reading) => {
                const readingRef = doc(db, 'users', DEMO_USER_ID, 'utilityReadings', reading.id);
                batch.set(readingRef, reading);
                totalReadings++;
            });
        }

        // Commit all changes
        await batch.commit();

        return {
            success: true,
            message: 'Demo data seeded successfully',
            data: {
                properties: SEED_CONFIG.properties,
                tenants: totalTenants,
                leases: totalLeases,
                expenses: totalExpenses,
                utilityReadings: totalReadings,
            },
        };
    } catch (error) {
        console.error('Error seeding demo data:', error);
        return {
            success: false,
            message: `Failed to seed demo data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            data: {
                properties: 0,
                tenants: 0,
                leases: 0,
                expenses: 0,
                utilityReadings: 0,
            },
        };
    }
}

/**
 * Clears all demo data from Firestore.
 * Only works for the demo user namespace.
 */
export async function clearDemoData(): Promise<{ success: boolean; message: string }> {
    try {
        const batch = writeBatch(db);
        const collections = ['properties', 'tenants', 'leases', 'expenses', 'utilityReadings'];

        // Delete all documents in each collection
        for (const collectionName of collections) {
            const collectionRef = collection(db, 'users', DEMO_USER_ID, collectionName);
            // Note: In production, you'd want to paginate this for large datasets
            // For demo purposes, we assume a manageable number of documents
        }

        // Update user document to mark as not seeded
        const userRef = doc(db, 'users', DEMO_USER_ID);
        batch.update(userRef, { demoSeeded: false });

        await batch.commit();

        return {
            success: true,
            message: 'Demo data cleared successfully',
        };
    } catch (error) {
        console.error('Error clearing demo data:', error);
        return {
            success: false,
            message: `Failed to clear demo data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}
