/**
 * Manual Demo Data Seeding Script
 * 
 * Seeds realistic lease data directly into the MVP Demo account
 * 
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
 *   npm run seed:demo
 * 
 * Or with inline JSON:
 *   export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
 *   npm run seed:demo
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Target Firebase project
const TARGET_PROJECT_ID = 'propflow-ai-483621';

// MVP Demo user email
const MVP_DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@propflow.com';

/**
 * Initialize Firebase Admin with robust credential detection
 */
function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        console.log('✅ Firebase Admin already initialized');
        return;
    }

    let credentialSource = 'unknown';
    let projectId = TARGET_PROJECT_ID;

    try {
        // Priority 1: GOOGLE_APPLICATION_CREDENTIALS environment variable (file path)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            console.log(`🔑 Using GOOGLE_APPLICATION_CREDENTIALS: ${credPath}`);

            if (!fs.existsSync(credPath)) {
                throw new Error(`Service account key file not found: ${credPath}`);
            }

            const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
            projectId = serviceAccount.project_id || TARGET_PROJECT_ID;

            initializeApp({
                credential: cert(serviceAccount),
                projectId,
            });

            credentialSource = 'GOOGLE_APPLICATION_CREDENTIALS (file)';
        }
        // Priority 2: FIREBASE_SERVICE_ACCOUNT_JSON environment variable (inline JSON)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            console.log('🔑 Using FIREBASE_SERVICE_ACCOUNT_JSON (inline)');

            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            projectId = serviceAccount.project_id || TARGET_PROJECT_ID;

            initializeApp({
                credential: cert(serviceAccount),
                projectId,
            });

            credentialSource = 'FIREBASE_SERVICE_ACCOUNT_JSON (env var)';
        }
        // Priority 3: Local service account key file (fallback)
        else {
            const localKeyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');

            if (fs.existsSync(localKeyPath)) {
                console.log(`🔑 Using local service account key: ${localKeyPath}`);

                const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
                projectId = serviceAccount.project_id || TARGET_PROJECT_ID;

                initializeApp({
                    credential: cert(serviceAccount),
                    projectId,
                });

                credentialSource = 'Local firebase-service-account-key.json';
            }
            // Priority 4: Application Default Credentials (requires gcloud)
            else {
                console.log('⚠️  No explicit credentials found, attempting Application Default Credentials (ADC)');
                console.log('   This requires: gcloud auth application-default login');

                initializeApp({
                    projectId: TARGET_PROJECT_ID,
                });

                credentialSource = 'Application Default Credentials (ADC)';
            }
        }

        console.log(`✅ Firebase Admin initialized`);
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Credential Source: ${credentialSource}`);

    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin');
        console.error('   Error:', error instanceof Error ? error.message : error);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Set GOOGLE_APPLICATION_CREDENTIALS to a valid service account JSON file:');
        console.error('      export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json');
        console.error('   2. Or set FIREBASE_SERVICE_ACCOUNT_JSON with inline JSON:');
        console.error('      export FIREBASE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
        console.error('   3. Or place firebase-service-account-key.json in the project root');
        console.error('   4. Generate a new service account key:');
        console.error('      https://console.firebase.google.com/project/propflow-ai-483621/settings/serviceaccounts/adminsdk');
        process.exit(1);
    }
}

/**
 * Preflight health check: verify Firestore credentials work
 */
async function preflightCheck(db: FirebaseFirestore.Firestore): Promise<boolean> {
    try {
        console.log('\n🏥 Running preflight health check...');

        // Attempt to write and read a temporary document
        const testDocRef = db.collection('_seed_preflight').doc(`test_${Date.now()}`);

        await testDocRef.set({
            timestamp: new Date(),
            purpose: 'credential_validation',
        });

        const testDoc = await testDocRef.get();

        if (!testDoc.exists) {
            throw new Error('Preflight write succeeded but read failed');
        }

        // Clean up test document
        await testDocRef.delete();

        console.log('✅ Preflight check passed - Firestore credentials are valid');
        return true;

    } catch (error: any) {
        console.error('❌ Preflight check failed - Firestore credentials are invalid');

        if (error.code === 16 || error.message?.includes('UNAUTHENTICATED')) {
            console.error('\n🔐 Authentication Error:');
            console.error('   Your service account key may be:');
            console.error('   - Revoked (key was deleted in GCP Console)');
            console.error('   - Disabled (service account was disabled)');
            console.error('   - Wrong project (key is for a different Firebase project)');
            console.error('\n💡 Solutions:');
            console.error('   1. Generate a new service account key:');
            console.error('      https://console.firebase.google.com/project/propflow-ai-483621/settings/serviceaccounts/adminsdk');
            console.error('   2. Or reuse your existing CI key (GitHub secret GCP_SA_KEY):');
            console.error('      cat > firebase-service-account-key.json <<\'JSON\'');
            console.error('      PASTE_YOUR_CI_KEY_JSON_HERE');
            console.error('      JSON');
            console.error('   3. Then run: export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/firebase-service-account-key.json');
        } else if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
            console.error('\n🚫 Permission Error:');
            console.error('   The service account lacks Firestore permissions.');
            console.error('   Grant "Cloud Datastore User" or "Firebase Admin" role in IAM.');
        } else {
            console.error('\n❌ Unexpected Error:', error.message || error);
        }

        return false;
    }
}

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

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
        // Run preflight health check
        const healthCheckPassed = await preflightCheck(db);
        if (!healthCheckPassed) {
            console.error('\n❌ Aborting seeding due to failed preflight check');
            process.exit(1);
        }

        console.log('\n🔍 Finding MVP Demo user...');

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
