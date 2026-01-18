/**
 * Clear Demo Data Script
 * 
 * Removes all demo data for demo@propflow.com
 * 
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
 *   npm run seed:demo:clear
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Target Firebase project
const TARGET_PROJECT_ID = 'propflow-ai-483621';
const MVP_DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@propflow.com';

/**
 * Initialize Firebase Admin with robust credential detection
 */
function initializeFirebaseAdmin() {
    if (getApps().length > 0) return;

    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
            initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || TARGET_PROJECT_ID });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || TARGET_PROJECT_ID });
        } else {
            const localKeyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');
            if (fs.existsSync(localKeyPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
                initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || TARGET_PROJECT_ID });
            } else {
                initializeApp({ projectId: TARGET_PROJECT_ID });
            }
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error instanceof Error ? error.message : error);
        console.error('Set GOOGLE_APPLICATION_CREDENTIALS or place firebase-service-account-key.json in project root');
        process.exit(1);
    }
}

initializeFirebaseAdmin();
const db = getFirestore();

async function clearDemoData() {
    try {
        console.log('🔍 Finding MVP Demo user...');

        const usersSnapshot = await db.collection('users')
            .where('email', '==', MVP_DEMO_EMAIL)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.error('❌ MVP Demo user not found with email:', MVP_DEMO_EMAIL);
            process.exit(1);
        }

        const demoUserId = usersSnapshot.docs[0].id;
        console.log('✅ Found demo user:', demoUserId);

        const batch = db.batch();
        let propertiesCount = 0;
        let tenantsCount = 0;
        let leasesCount = 0;

        // Delete properties and associated data
        const allProperties = await db.collection('properties')
            .where('ownerUserId', '==', demoUserId)
            .get();

        propertiesCount = allProperties.size;

        for (const doc of allProperties.docs) {
            batch.delete(doc.ref);

            // Delete associated tenants
            const tenants = await db.collection('tenants')
                .where('propertyId', '==', doc.id)
                .get();
            tenantsCount += tenants.size;
            tenants.docs.forEach(t => batch.delete(t.ref));

            // Delete associated leases
            const leases = await db.collection('leases')
                .where('propertyId', '==', doc.id)
                .get();
            leasesCount += leases.size;
            leases.docs.forEach(l => batch.delete(l.ref));
        }

        // Update user flags
        batch.update(db.collection('users').doc(demoUserId), {
            demoSeeded: false,
            demoActivated: false,
            updatedAt: new Date(),
        });

        await batch.commit();

        console.log('✅ Demo data cleared successfully');
        console.log(`📊 Deleted:`);
        console.log(`   - ${propertiesCount} properties`);
        console.log(`   - ${tenantsCount} tenants`);
        console.log(`   - ${leasesCount} leases`);

    } catch (error) {
        console.error('❌ Error clearing demo data:', error);
        process.exit(1);
    }
}

clearDemoData()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
