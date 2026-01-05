'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
    try {
        console.log('[Server Action] Starting seeding process...');

        // 1. Clean data (Order matters for foreign keys)
        await prisma.tenant.deleteMany({});
        await prisma.property.deleteMany({});
        await prisma.user.deleteMany({});

        // 2. Create Users with Passwords
        const passwordHash = await bcrypt.hash('password123', 10);

        const ownerUser = await prisma.user.create({
            data: {
                email: 'owner@propflow.ai',
                role: 'OWNER',
                firstName: 'Alex',
                lastName: 'Owner',
                phone: '555-0100',
                passwordHash
            }
        });

        await prisma.user.create({
            data: {
                email: 'manager@propflow.ai',
                role: 'PROPERTY_MANAGER',
                firstName: 'Manny',
                lastName: 'Manager',
                phone: '555-0101',
                passwordHash
            }
        });

        const userAlice = await prisma.user.create({
            data: {
                email: 'alice@example.com',
                role: 'TENANT',
                firstName: 'Alice',
                lastName: 'Anderson',
                passwordHash
            }
        });

        // 3. Create Properties
        const sunsetApts = await prisma.property.create({
            data: {
                name: 'Sunset Apartments',
                address: '123 Sunset Blvd, Los Angeles, CA',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90028',
                propertyType: 'Multi-Family',
                units: 10,
                ownerUserId: ownerUser.id,
            }
        });

        await prisma.property.create({
            data: {
                name: 'Cozy Cottage',
                address: '42 Maple Lane, Austin, TX',
                city: 'Austin',
                state: 'TX',
                zipCode: '78701',
                propertyType: 'Single Family',
                units: 1,
                ownerUserId: ownerUser.id,
            }
        });

        // 4. Create Tenant (Alice)
        await prisma.tenant.create({
            data: {
                propertyId: sunsetApts.id,
                name: 'Alice Anderson',
                email: 'alice@example.com',
                phone: '555-0201',
                status: 'active',
                leaseStartDate: new Date('2024-01-01'),
                leaseEndDate: new Date('2025-01-01'),
                rentAmount: 2500,
                apartmentNumber: '1A',
                squareFootage: 800,
                numberOfOccupants: 1,
                userId: userAlice.id
            }
        });

        console.log('[Server Action] Seeding finished successfully.');
        return { success: true, message: 'Database seeded successfully! Try logging in now.' };

    } catch (error: unknown) {
        console.error('[Server Action] Seeding Error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Failed: ${msg}` };
    }
}
