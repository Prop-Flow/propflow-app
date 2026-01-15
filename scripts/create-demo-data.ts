import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize Firebase Admin
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../firebase-service-account-key.json'), 'utf-8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createDemoData() {
    try {
        console.log('Creating demo user documents and properties...');

        // User data
        const users = [
            {
                uid: 'g7FS978xSIZduRmw377lHOo8AU82',
                email: 'demo-owner@propflow.com',
                firstName: 'Sarah',
                lastName: 'Johnson',
                phone: '+15551234567',
                role: 'OWNER'
            },
            {
                uid: 'SFoyLi8r7dbM4YPFBVOP1Mgpyrq2',
                email: 'demo-manager@propflow.com',
                firstName: 'Mike',
                lastName: 'Chen',
                phone: '+15551234568',
                role: 'MANAGER'
            },
            {
                uid: 'MciPtCS843NeGNpDkU21eQr0EKn2',
                email: 'demo-tenant@propflow.com',
                firstName: 'Alex',
                lastName: 'Rivera',
                phone: '+15551234569',
                role: 'TENANT'
            }
        ];

        // Create/update user documents
        for (const user of users) {
            const userRef = db.collection('users').doc(user.uid);
            await userRef.set({
                ...user,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`✓ Created/updated user: ${user.email}`);
        }

        // Demo properties for Sarah Johnson (Owner)
        const sarahProperties = [
            {
                name: 'Sunset Apartments',
                address: '123 Main St, San Francisco, CA 94102',
                type: 'MULTI_FAMILY',
                units: 12,
                status: 'ACTIVE',
                purchasePrice: 2500000,
                currentValue: 2800000,
                monthlyIncome: 18000,
                monthlyExpenses: 8500
            },
            {
                name: 'Downtown Office Complex',
                address: '456 Market St, San Francisco, CA 94103',
                type: 'COMMERCIAL',
                units: 8,
                status: 'ACTIVE',
                purchasePrice: 4200000,
                currentValue: 4600000,
                monthlyIncome: 32000,
                monthlyExpenses: 15000
            }
        ];

        for (const property of sarahProperties) {
            const propRef = db.collection('users').doc(users[0].uid).collection('properties').doc();
            await propRef.set({
                ...property,
                ownerId: users[0].uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✓ Created property for Sarah: ${property.name}`);
        }

        // Demo property for Mike Chen (Manager)
        const mikeProperties = [
            {
                name: 'Riverside Condos',
                address: '789 River Rd, Oakland, CA 94601',
                type: 'MULTI_FAMILY',
                units: 24,
                status: 'ACTIVE',
                purchasePrice: 3800000,
                currentValue: 4100000,
                monthlyIncome: 28000,
                monthlyExpenses: 14000
            }
        ];

        for (const property of mikeProperties) {
            const propRef = db.collection('users').doc(users[1].uid).collection('properties').doc();
            await propRef.set({
                ...property,
                ownerId: users[1].uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✓ Created property for Mike: ${property.name}`);
        }

        console.log('\n✅ Demo data creation complete!');
        console.log('\nDemo Accounts:');
        console.log('1. demo-owner@propflow.com (Sarah Johnson) - 2 properties');
        console.log('2. demo-manager@propflow.com (Mike Chen) - 1 property');
        console.log('3. demo-tenant@propflow.com (Alex Rivera) - 0 properties');

    } catch (error) {
        console.error('Error creating demo data:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

createDemoData();
