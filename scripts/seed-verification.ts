
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import fs from 'fs';
import path from 'path';

// Manually load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'verify_owner@test.com';
    const password = 'Password123!';
    const hashedPassword = await hash(password, 10);

    console.log('Using database URL:', process.env.DATABASE_URL); // Debug url

    // 1. Clean up existing test verification user if exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.log('Cleaning up old verification user...');
        await prisma.user.delete({ where: { email } });
    }

    // 2. Create Owner User
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Verify Owner',
            role: 'OWNER', // Ensure role matches what the dashboard expects contextually, though app checks 'owner' string usually
            passwordHash: hashedPassword,
        },
    });
    console.log(`Created user: ${user.email}`);

    // 3. Create Property 1 (High performing)
    await prisma.property.create({
        data: {
            ownerUserId: user.id,
            name: 'Verification Heights',
            address: '123 Verify Ln',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
            tenants: {
                create: {
                    name: 'Tenant One',
                    status: 'active',
                    rentAmount: 5000
                }
            },
            financials: {
                create: {
                    totalMonthlyIncome: 5000,
                    totalMonthlyExpenses: 1500,
                    monthlyNetIncome: 3500,
                    vacancyRate: 0, // 0% vacancy = 100% occupancy
                },
            },
        },
    });

    // 4. Create Property 2 (Moderate)
    await prisma.property.create({
        data: {
            ownerUserId: user.id,
            name: 'Test Plaza',
            address: '456 Test Blvd',
            city: 'Test Ville',
            state: 'TV',
            zipCode: '67890',
            country: 'USA',
            tenants: {
                create: {
                    name: 'Tenant Two',
                    status: 'active',
                    rentAmount: 3000
                }
            },
            financials: {
                create: {
                    totalMonthlyIncome: 3000,
                    totalMonthlyExpenses: 1000,
                    monthlyNetIncome: 2000,
                    vacancyRate: 10, // 10% vacancy = 90% occupancy
                },
            },
        },
    });

    console.log('Seeding complete.');
    console.log('Expected Stats:');
    console.log('- Properties: 2');
    console.log('- Tenants: 2');
    console.log('- Revenue: $8,000');
    console.log('- Expenses: $2,500');
    console.log('- Net Income: $5,500');
    console.log('- Occupancy Rate: 95% (Avg of 100% and 90%)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
