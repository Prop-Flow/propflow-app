import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        projectId: 'propflow-ai-483621',
    });
}

const auth = getAuth();
const db = getFirestore();

interface DemoAccount {
    email: string;
    password: string;
    displayName: string;
    role: 'OWNER' | 'MANAGER' | 'TENANT';
    firstName: string;
    lastName: string;
    phone: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
    {
        email: 'demo-owner@propflow.com',
        password: 'DemoOwner123!',
        displayName: 'Sarah Johnson',
        role: 'OWNER',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+15551234567',
    },
    {
        email: 'demo-manager@propflow.com',
        password: 'DemoManager123!',
        displayName: 'Mike Chen',
        role: 'MANAGER',
        firstName: 'Mike',
        lastName: 'Chen',
        phone: '+15551234568',
    },
    {
        email: 'demo-tenant@propflow.com',
        password: 'DemoTenant123!',
        displayName: 'Alex Rivera',
        role: 'TENANT',
        firstName: 'Alex',
        lastName: 'Rivera',
        phone: '+15551234569',
    },
];

async function createDemoAccounts() {
    console.log('🔐 Creating demo accounts...\n');

    const createdAccounts: { [key: string]: string } = {};

    for (const account of DEMO_ACCOUNTS) {
        try {
            // Check if user already exists
            let user;
            try {
                user = await auth.getUserByEmail(account.email);
                console.log(`✓ User ${account.email} already exists (UID: ${user.uid})`);
            } catch (error) {
                // User doesn't exist, create it
                user = await auth.createUser({
                    email: account.email,
                    password: account.password,
                    displayName: account.displayName,
                    emailVerified: true,
                });
                console.log(`✓ Created user ${account.email} (UID: ${user.uid})`);
            }

            // Create/update user document in Firestore
            await db.collection('users').doc(user.uid).set({
                email: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
                phone: account.phone,
                role: account.role,
                uid: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }, { merge: true });

            console.log(`✓ Created/updated Firestore document for ${account.email}`);
            createdAccounts[account.role] = user.uid;

        } catch (error) {
            console.error(`✗ Error creating account ${account.email}:`, error);
        }
    }

    console.log('\n📋 Demo Account Summary:');
    console.log('========================');
    for (const account of DEMO_ACCOUNTS) {
        console.log(`\n${account.role}:`);
        console.log(`  Email: ${account.email}`);
        console.log(`  Password: ${account.password}`);
        console.log(`  Name: ${account.displayName}`);
    }

    return createdAccounts;
}

async function createDemoProperties(ownerUid: string, managerUid: string) {
    console.log('\n🏢 Creating demo properties...\n');

    const properties = [
        {
            name: 'Sunset Apartments',
            address: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            units: 12,
            occupiedUnits: 10,
            ownerUserId: ownerUid,
            managerIds: [managerUid],
            monthlyRent: 36000, // $3,000/unit average
        },
        {
            name: 'Downtown Lofts',
            address: '456 Oak Avenue',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94103',
            units: 8,
            occupiedUnits: 8,
            ownerUserId: ownerUid,
            managerIds: [managerUid],
            monthlyRent: 32000, // $4,000/unit average
        },
        {
            name: 'Riverside Complex',
            address: '789 River Road',
            city: 'Oakland',
            state: 'CA',
            zipCode: '94601',
            units: 20,
            occupiedUnits: 18,
            ownerUserId: ownerUid,
            managerIds: [], // Self-managed
            monthlyRent: 45000, // $2,500/unit average
        },
    ];

    const propertyIds: string[] = [];

    for (const property of properties) {
        const propertyRef = await db.collection('properties').add({
            ...property,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log(`✓ Created property: ${property.name} (ID: ${propertyRef.id})`);
        propertyIds.push(propertyRef.id);
    }

    return propertyIds;
}

async function createDemoTenants(propertyIds: string[], tenantUid: string) {
    console.log('\n👥 Creating demo tenants...\n');

    const tenants = [
        // Sunset Apartments (10 tenants)
        {
            propertyId: propertyIds[0],
            name: 'Alex Rivera',
            email: 'demo-tenant@propflow.com',
            phone: '+15551234569',
            userId: tenantUid, // Link to demo tenant account
            apartmentNumber: '2A',
            rentAmount: 3200,
            leaseStartDate: new Date('2024-01-01'),
            leaseEndDate: new Date('2025-01-01'),
            status: 'active',
        },
        {
            propertyId: propertyIds[0],
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+15551111111',
            apartmentNumber: '1A',
            rentAmount: 3000,
            leaseStartDate: new Date('2024-03-01'),
            leaseEndDate: new Date('2025-03-01'),
            status: 'active',
        },
        {
            propertyId: propertyIds[0],
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            phone: '+15552222222',
            apartmentNumber: '1B',
            rentAmount: 3100,
            leaseStartDate: new Date('2024-02-15'),
            leaseEndDate: new Date('2025-02-15'),
            status: 'active',
        },
        // Add more tenants for other properties...
        // Downtown Lofts (8 tenants)
        {
            propertyId: propertyIds[1],
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '+15553333333',
            apartmentNumber: '301',
            rentAmount: 4200,
            leaseStartDate: new Date('2024-01-15'),
            leaseEndDate: new Date('2025-01-15'),
            status: 'active',
        },
        // Riverside Complex (18 tenants)
        {
            propertyId: propertyIds[2],
            name: 'Jessica Wilson',
            email: 'jessica.wilson@example.com',
            phone: '+15554444444',
            apartmentNumber: 'A101',
            rentAmount: 2400,
            leaseStartDate: new Date('2024-04-01'),
            leaseEndDate: new Date('2025-04-01'),
            status: 'active',
        },
    ];

    for (const tenant of tenants) {
        await db.collection('tenants').add({
            ...tenant,
            createdAt: Timestamp.now(),
        });

        console.log(`✓ Created tenant: ${tenant.name} at ${tenant.apartmentNumber}`);
    }
}

async function createDemoMaintenanceRequests(propertyIds: string[]) {
    console.log('\n🔧 Creating demo maintenance requests...\n');

    const requests = [
        {
            propertyId: propertyIds[0],
            apartmentNumber: '2A',
            title: 'Leaking faucet in kitchen',
            description: 'The kitchen faucet has been dripping constantly for the past week.',
            status: 'open',
            priority: 'medium',
            category: 'plumbing',
        },
        {
            propertyId: propertyIds[0],
            apartmentNumber: '1B',
            title: 'AC not cooling properly',
            description: 'Air conditioning unit is running but not cooling the apartment.',
            status: 'in_progress',
            priority: 'high',
            category: 'hvac',
        },
        {
            propertyId: propertyIds[1],
            apartmentNumber: '301',
            title: 'Broken window latch',
            description: 'Window latch in bedroom is broken and won\'t lock.',
            status: 'open',
            priority: 'low',
            category: 'general',
        },
    ];

    for (const request of requests) {
        await db.collection('maintenance').add({
            ...request,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log(`✓ Created maintenance request: ${request.title}`);
    }
}

async function main() {
    try {
        console.log('🚀 Starting demo data seeding...\n');

        // Step 1: Create demo accounts
        const accounts = await createDemoAccounts();

        // Step 2: Create demo properties
        const propertyIds = await createDemoProperties(accounts.OWNER, accounts.MANAGER);

        // Step 3: Create demo tenants
        await createDemoTenants(propertyIds, accounts.TENANT);

        // Step 4: Create demo maintenance requests
        await createDemoMaintenanceRequests(propertyIds);

        console.log('\n✅ Demo data seeding complete!\n');
        console.log('You can now login with any of the demo accounts listed above.');

    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
        process.exit(1);
    }
}

main();
