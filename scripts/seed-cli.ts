
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING POSTGRES START ---');

    // Cleanup
    console.log('Cleaning tables...');
    try {
        await prisma.tenantUtilityCharge.deleteMany();
        await prisma.utilityBill.deleteMany();
        await prisma.communicationLog.deleteMany();
        await prisma.leaseRecommendation.deleteMany();
        await prisma.leaseOptimization.deleteMany();
        await prisma.maintenanceRequest.deleteMany();
        await prisma.complianceItem.deleteMany();
        await prisma.document.deleteMany();
        await prisma.tenant.deleteMany();
        await prisma.property.deleteMany();
        await prisma.user.deleteMany();
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log('Cleanup error (ignoring):', msg);
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating Owner...');
    const owner = await prisma.user.create({
        data: {
            email: 'owner@propflow.ai',
            role: 'OWNER',
            firstName: 'Alex',
            lastName: 'Owner',
            passwordHash
        }
    });

    console.log('Creating Manager...');
    await prisma.user.create({
        data: {
            email: 'manager@propflow.ai',
            role: 'PROPERTY_MANAGER',
            firstName: 'Manny',
            lastName: 'Manager',
            passwordHash
        }
    });

    console.log('Creating Properties...');
    await prisma.property.create({
        data: {
            name: 'Sunset Apartments',
            address: '123 Sunset Blvd',
            units: 10,
            ownerUserId: owner.id
        }
    });

    console.log('--- SEEDING DONE ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
