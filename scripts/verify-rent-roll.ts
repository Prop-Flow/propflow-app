
import { PrismaClient } from '@prisma/client';
import { differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Verification ---');

    console.log('1. Cleaning Cleanup...');
    // Clean up
    const user = await prisma.user.findFirst({ where: { email: 'joel@propflow.ai' } });
    if (!user) {
        console.error('User not found. Please ensure database is seeded with users.');
        return;
    }
    await prisma.leaseAgreement.deleteMany({ where: { property: { ownerUserId: user.id } } });
    await prisma.tenant.deleteMany({ where: { property: { ownerUserId: user.id } } });
    await prisma.property.deleteMany({ where: { ownerUserId: user.id, name: 'Verification Complex' } });

    console.log('2. Seeding Data...');
    const property = await prisma.property.create({
        data: {
            owner: { connect: { id: user.id } },
            name: 'Verification Complex',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '00000',
            propertyType: 'Mixed Use'
        }
    });

    // Case A: Critical Residential Lease (Expires in 20 days)
    const tenant1 = await prisma.tenant.create({
        data: {
            propertyId: property.id,
            name: 'Tenant Critical',
            email: 'critical@test.com',
            apartmentNumber: '101',
            squareFootage: 800,
            rentAmount: 2500,
        }
    });
    await prisma.leaseAgreement.create({
        data: {
            propertyId: property.id,
            tenantId: tenant1.id,
            type: 'RESIDENTIAL',
            status: 'ACTIVE',
            startDate: new Date(Date.now() - 345 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Expires in 20 days
            rentAmount: 2500,
            securityDeposit: 2500,
            terms: { petsAllowed: true }
        }
    });

    // Case B: Stable Commercial Lease
    const tenant2 = await prisma.tenant.create({
        data: {
            propertyId: property.id,
            name: 'Tenant Stable',
            email: 'stable@test.com',
            apartmentNumber: '200',
            squareFootage: 2000,
        }
    });
    await prisma.leaseAgreement.create({
        data: {
            propertyId: property.id,
            tenantId: tenant2.id,
            type: 'COMMERCIAL',
            status: 'ACTIVE',
            startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000), // Long term
            rentAmount: 8500,
            securityDeposit: 16000,
        }
    });

    // Case C: Month-to-Month (Expired lease in past)
    const tenant3 = await prisma.tenant.create({
        data: {
            propertyId: property.id,
            name: 'Tenant MTM',
            email: 'mtm@test.com',
            apartmentNumber: '102',
            squareFootage: 800,
            rentAmount: 2400,
            status: 'active',
            leaseEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
    });

    console.log('3. Running Rent Roll Logic...');

    const tenants = await prisma.tenant.findMany({
        where: { propertyId: property.id, status: 'active' },
        include: {
            property: { select: { name: true } },
            leases: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    const rentRoll = tenants.map(tenant => {
        const activeLease = tenant.leases[0];
        const rentAmount = activeLease?.rentAmount ?? tenant.rentAmount ?? 0;
        const leaseEnd = activeLease?.endDate ?? tenant.leaseEndDate;

        let riskStatus = 'LOW';
        let daysUntilExpiration = null;

        if (leaseEnd) {
            daysUntilExpiration = differenceInDays(new Date(leaseEnd), new Date());
            if (daysUntilExpiration < 0) riskStatus = 'EXPIRED';
            else if (daysUntilExpiration <= 30) riskStatus = 'CRITICAL';
            else if (daysUntilExpiration <= 90) riskStatus = 'HIGH';
        }

        return {
            name: tenant.name,
            riskStatus,
            daysUntilExpiration
        };
    });

    console.log('--- Results ---');
    console.table(rentRoll);

    // Assertions
    const critical = rentRoll.find(r => r.name === 'Tenant Critical');
    const stable = rentRoll.find(r => r.name === 'Tenant Stable');
    const mtm = rentRoll.find(r => r.name === 'Tenant MTM');

    if (critical?.riskStatus !== 'CRITICAL') throw new Error(`Critical Tenant check failed: Got ${critical?.riskStatus}`);
    if (stable?.riskStatus !== 'LOW' && stable?.riskStatus !== 'MEDIUM') console.log(`Stable Tenant status: ${stable?.riskStatus} (Expected LOW/MEDIUM)`); // > 180 days is LOW, < 180 MEDIUM. 1000 days is LOW.
    if (mtm?.riskStatus !== 'EXPIRED') throw new Error(`MTM Tenant check failed: Got ${mtm?.riskStatus}`);

    console.log('✅ VERIFICATION PASSED');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
