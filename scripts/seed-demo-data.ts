/**
 * Manual Demo Data Seeding Script
 * 
 * Seeds realistic lease data directly into the MVP Demo account
 * Run with: npx tsx scripts/seed-demo-data.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

// MVP Demo user email
const MVP_DEMO_EMAIL = 'demo@propflow.com';

// Realistic mock data for The Rise at State College
const MOCK_PROPERTY = {
    name: 'The Rise at State College LLC',
    address: '532 E College Ave',
    city: 'State College',
    state: 'PA',
    zipCode: '16801',
    propertyType: 'MULTI_FAMILY',
    units: 12,
    status: 'ACTIVE',
    yearBuilt: 2018,
    propertyManager: 'Michael Chen',
    purchasePrice: 2800000,
    currentValue: 3200000,
    financials: {
        totalMonthlyIncome: 6125,
        totalMonthlyExpenses: 2450,
        monthlyNetIncome: 3675,
        vacancyRate: 58, // 7 vacant units out of 12
    },
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
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
        status: 'active',
        specialNotes: '2BR/2BA Shared - Bedroom 1 (Individual lease)',
        parking: 'Space A-91 (Underground, shared with unit)',
        vehicle: '2022 Mazda CX-5 (Red, PLM-8273)',
        insurance: 'Geico (7291-SC-4482)',
        guarantor: 'Linda Chen (Mother)',
        roommate: 'Jessica Marie Williams',
    },
];

async function seedDemoData() {
    try {
        console.log('🔍 Finding MVP Demo user...');

        // Find the demo user by email
        const usersSnapshot = await db.collection('users')
            .where('email', '==', MVP_DEMO_EMAIL)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.error('❌ MVP Demo user not found with email:', MVP_DEMO_EMAIL);
            console.log('Please create the user account first');
            process.exit(1);
        }

        const demoUserId = usersSnapshot.docs[0].id;
        console.log('✅ Found demo user:', demoUserId);

        // Check if already seeded
        const existingProperties = await db.collection('properties')
            .where('ownerUserId', '==', demoUserId)
            .limit(1)
            .get();

        if (!existingProperties.empty) {
            console.log('⚠️  Demo data already exists. Clearing first...');

            // Delete existing data
            const batch = db.batch();

            const allProperties = await db.collection('properties')
                .where('ownerUserId', '==', demoUserId)
                .get();

            for (const doc of allProperties.docs) {
                batch.delete(doc.ref);

                // Delete associated tenants
                const tenants = await db.collection('tenants')
                    .where('propertyId', '==', doc.id)
                    .get();
                tenants.docs.forEach(t => batch.delete(t.ref));

                // Delete associated leases
                const leases = await db.collection('leases')
                    .where('propertyId', '==', doc.id)
                    .get();
                leases.docs.forEach(l => batch.delete(l.ref));
            }

            await batch.commit();
            console.log('✅ Cleared existing demo data');
        }

        console.log('\n📝 Seeding realistic lease data...');

        // Create the property
        const propertyRef = db.collection('properties').doc();
        const propertyId = propertyRef.id;

        await propertyRef.set({
            ...MOCK_PROPERTY,
            ownerUserId: demoUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('✅ Created property:', MOCK_PROPERTY.name);

        // Create tenants and leases
        let tenantCount = 0;
        for (const tenantData of MOCK_TENANTS) {
            const tenantRef = db.collection('tenants').doc();
            const tenantId = tenantRef.id;

            // Calculate total monthly rent
            const totalRent = tenantData.monthlyRent +
                (tenantData.petRent || 0) +
                (tenantData.additionalParkingFee || 0);

            await tenantRef.set({
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

            // Create lease
            const leaseRef = db.collection('leases').doc();
            await leaseRef.set({
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
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            tenantCount++;
            console.log(`✅ Created tenant ${tenantCount}/5: ${tenantData.firstName} ${tenantData.lastName} (Unit ${tenantData.unitNumber})`);
        }

        // Update user to mark as demo seeded and activated
        await db.collection('users').doc(demoUserId).update({
            demoSeeded: true,
            demoActivated: true,
            demoProfile: 'mvp_demo',
            updatedAt: new Date(),
        });

        console.log('\n✅ Demo data seeded successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - 1 property: ${MOCK_PROPERTY.name}`);
        console.log(`   - 5 tenants with realistic details`);
        console.log(`   - 5 active leases`);
        console.log(`   - Demo activated and ready for use`);

    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDemoData()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
