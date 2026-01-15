const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createDemoData() {
    try {
        console.log('Importing demo data into Firestore...\n');

        // Create Alex Rivera user document
        await db.collection('users').doc('MciPtCS843NeGNpDkU21eQr0EKn2').set({
            email: 'demo-tenant@propflow.com',
            firstName: 'Alex',
            lastName: 'Rivera',
            phone: '+15551234569',
            role: 'TENANT',
            uid: 'MciPtCS843NeGNpDkU21eQr0EKn2',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✓ Created Alex Rivera user document');

        // Create properties for Sarah Johnson (Owner)
        await db.collection('users').doc('g7FS978xSIZduRmw377lHOo8AU82')
            .collection('properties').doc('sunset-apartments').set({
                name: 'Sunset Apartments',
                address: '123 Main St, San Francisco, CA 94102',
                type: 'MULTI_FAMILY',
                units: 12,
                status: 'ACTIVE',
                purchasePrice: 2500000,
                currentValue: 2800000,
                monthlyIncome: 18000,
                monthlyExpenses: 8500,
                ownerId: 'g7FS978xSIZduRmw377lHOo8AU82',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        console.log('✓ Created Sunset Apartments for Sarah');

        await db.collection('users').doc('g7FS978xSIZduRmw377lHOo8AU82')
            .collection('properties').doc('downtown-office').set({
                name: 'Downtown Office Complex',
                address: '456 Market St, San Francisco, CA 94103',
                type: 'COMMERCIAL',
                units: 8,
                status: 'ACTIVE',
                purchasePrice: 4200000,
                currentValue: 4600000,
                monthlyIncome: 32000,
                monthlyExpenses: 15000,
                ownerId: 'g7FS978xSIZduRmw377lHOo8AU82',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        console.log('✓ Created Downtown Office Complex for Sarah');

        // Create property for Mike Chen (Manager)
        await db.collection('users').doc('SFoyLi8r7dbM4YPFBVOP1Mgpyrq2')
            .collection('properties').doc('riverside-condos').set({
                name: 'Riverside Condos',
                address: '789 River Rd, Oakland, CA 94601',
                type: 'MULTI_FAMILY',
                units: 24,
                status: 'ACTIVE',
                purchasePrice: 3800000,
                currentValue: 4100000,
                monthlyIncome: 28000,
                monthlyExpenses: 14000,
                ownerId: 'SFoyLi8r7dbM4YPFBVOP1Mgpyrq2',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        console.log('✓ Created Riverside Condos for Mike');

        console.log('\n✅ Demo data import complete!\n');
        console.log('Demo Accounts:');
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
