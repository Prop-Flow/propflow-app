/**
 * Demo Data Seeding Service
 * 
 * Seeds realistic mock data for demo mode based on The Rise at State College property.
 * All data is idempotent and namespaced under the demo user.
 */

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { DEMO_USER_ID } from '@/lib/config/demo';

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
 * Realistic mock data for The Rise at State College
 */
const MOCK_PROPERTY = {
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
    monthlyIncome: 6125, // Sum of all rents
    monthlyExpenses: 2450, // ~40% of income
    occupancyRate: 42, // 5 out of 12 units occupied
};

const MOCK_TENANTS = [
    {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.patel@psu.edu',
        phone: '(814) 555-0123',
        unitNumber: '1203',
        monthlyRent: 1625,
        securityDeposit: 1625,
        leaseStartDate: '2025-08-15',
        leaseEndDate: '2026-07-31',
        leaseTerm: 12,
        status: 'ACTIVE',
        specialNotes: 'Graduate student floor - PhD Candidate, Materials Science',
        parking: 'Space A-95 (Underground, EV charging)',
        vehicle: 'Tesla Model 3',
        insurance: 'Liberty Mutual (LM-8472-PP)',
        guarantor: 'Raj Patel (Spouse)',
    },
    {
        firstName: 'Marcus',
        lastName: 'Thompson',
        email: 'marcus.thompson@psu.edu',
        phone: '(814) 555-0124',
        unitNumber: '823',
        monthlyRent: 1295,
        petRent: 35,
        securityDeposit: 1295,
        petDeposit: 300,
        leaseStartDate: '2025-08-15',
        leaseEndDate: '2026-05-15',
        leaseTerm: 9,
        status: 'ACTIVE',
        specialNotes: 'Pet: Shadow (Black cat, 12 lbs)',
        parking: 'Space B-23 (Underground)',
        vehicle: '2020 Toyota Camry (Blue, HBN-7392)',
        insurance: 'Allstate (482-MT-9471)',
        guarantor: 'David Thompson (Father)',
    },
    {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@psu.edu',
        phone: '(814) 555-0125',
        unitNumber: '407',
        monthlyRent: 1485,
        securityDeposit: 1485,
        leaseStartDate: '2025-08-15',
        leaseEndDate: '2026-05-15',
        leaseTerm: 9,
        status: 'ACTIVE',
        specialNotes: 'No pets',
        parking: 'Space A-47 (Underground)',
        vehicle: '2021 Honda Civic (Silver, KXY-4821)',
        insurance: 'State Farm (75-B9-K472-8)',
        guarantor: 'Maria Rodriguez (Mother)',
    },
    {
        firstName: 'Alexander',
        lastName: 'Patterson',
        email: 'alexander.patterson@psu.edu',
        phone: '(814) 555-0126',
        unitNumber: '614',
        monthlyRent: 785,
        additionalParkingFee: 75,
        securityDeposit: 785,
        leaseStartDate: '2025-08-15',
        leaseEndDate: '2026-05-15',
        leaseTerm: 9,
        status: 'ACTIVE',
        specialNotes: '3BR/3BA Shared - Bedroom 1 (Individual lease)',
        parking: 'Space B-45 + B-46 (Additional $75/month)',
        vehicle: '2019 Ford F-150 (Black, MKT-5621)',
        insurance: 'State Farm (84-AP-6621)',
        guarantor: 'Robert Patterson (Father)',
        roommates: 'Christopher Ryan Martinez, Daniel Scott Kim',
    },
    {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@psu.edu',
        phone: '(814) 555-0127',
        unitNumber: '1105',
        monthlyRent: 875,
        securityDeposit: 875,
        leaseStartDate: '2025-08-15',
        leaseEndDate: '2026-07-31',
        leaseTerm: 12,
        status: 'ACTIVE',
        specialNotes: '2BR/2BA Shared - Bedroom 1 (Individual lease)',
        parking: 'Space A-91 (Underground, shared with unit)',
        vehicle: '2022 Mazda CX-5 (Red, PLM-8273)',
        insurance: 'Geico (7291-SC-4482)',
        guarantor: 'Linda Chen (Mother)',
        roommate: 'Jessica Marie Williams',
    },
];

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
 * Seeds realistic demo data for The Rise at State College
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
        let propertyCount = 0;
        let tenantCount = 0;
        let leaseCount = 0;

        // Create the property
        const propertyRef = doc(collection(db, 'properties'));
        const propertyId = propertyRef.id;

        batch.set(propertyRef, {
            ...MOCK_PROPERTY,
            ownerUserId: DEMO_USER_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        propertyCount++;

        // Create tenants and leases
        for (const tenantData of MOCK_TENANTS) {
            const tenantRef = doc(collection(db, 'tenants'));
            const tenantId = tenantRef.id;

            // Calculate total monthly rent (including pet rent and parking)
            const totalRent = tenantData.monthlyRent +
                (tenantData.petRent || 0) +
                (tenantData.additionalParkingFee || 0);

            batch.set(tenantRef, {
                propertyId,
                firstName: tenantData.firstName,
                lastName: tenantData.lastName,
                name: `${tenantData.firstName} ${tenantData.lastName}`,
                email: tenantData.email,
                phone: tenantData.phone,
                apartmentNumber: tenantData.unitNumber,
                rentAmount: totalRent,
                status: tenantData.status,
                specialNotes: tenantData.specialNotes,
                parking: tenantData.parking,
                vehicle: tenantData.vehicle,
                insurance: tenantData.insurance,
                guarantor: tenantData.guarantor,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            tenantCount++;

            // Create lease
            const leaseRef = doc(collection(db, 'leases'));
            batch.set(leaseRef, {
                propertyId,
                tenantId,
                unitNumber: tenantData.unitNumber,
                startDate: new Date(tenantData.leaseStartDate),
                endDate: new Date(tenantData.leaseEndDate),
                monthlyRent: tenantData.monthlyRent,
                petRent: tenantData.petRent || 0,
                additionalFees: tenantData.additionalParkingFee || 0,
                securityDeposit: tenantData.securityDeposit,
                petDeposit: tenantData.petDeposit || 0,
                leaseTerm: tenantData.leaseTerm,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            leaseCount++;
        }

        // Mark user as demo seeded
        const userRef = doc(db, 'users', DEMO_USER_ID);
        batch.set(userRef, {
            demoSeeded: true,
            demoProfile: 'mvp_demo',
            updatedAt: new Date(),
        }, { merge: true });

        // Commit all changes
        await batch.commit();

        return {
            success: true,
            message: 'Demo data seeded successfully',
            data: {
                properties: propertyCount,
                tenants: tenantCount,
                leases: leaseCount,
                expenses: 0,
                utilityReadings: 0,
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
 * Clears all demo data for the demo user
 */
export async function clearDemoData(): Promise<DemoSeedResult> {
    try {
        const batch = writeBatch(db);

        // Delete properties
        const propertiesSnapshot = await getDocs(
            query(collection(db, 'properties'), where('ownerUserId', '==', DEMO_USER_ID))
        );
        propertiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Delete tenants
        const tenantsSnapshot = await getDocs(
            query(collection(db, 'tenants'), where('propertyId', 'in', propertiesSnapshot.docs.map(d => d.id)))
        );
        tenantsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Delete leases
        const leasesSnapshot = await getDocs(
            query(collection(db, 'leases'), where('propertyId', 'in', propertiesSnapshot.docs.map(d => d.id)))
        );
        leasesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Update user to mark as not seeded
        const userRef = doc(db, 'users', DEMO_USER_ID);
        batch.set(userRef, {
            demoSeeded: false,
            updatedAt: new Date(),
        }, { merge: true });

        await batch.commit();

        return {
            success: true,
            message: 'Demo data cleared successfully',
            data: {
                properties: propertiesSnapshot.size,
                tenants: tenantsSnapshot.size,
                leases: leasesSnapshot.size,
                expenses: 0,
                utilityReadings: 0,
            },
        };
    } catch (error) {
        console.error('Error clearing demo data:', error);
        return {
            success: false,
            message: `Failed to clear demo data: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
