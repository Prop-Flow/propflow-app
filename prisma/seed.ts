import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean existing data used for testing
    // Order matters due to foreign keys
    await prisma.tenant.deleteMany({})
    await prisma.property.deleteMany({})
    await prisma.user.deleteMany({})

    // 1. Create Users
    const ownerUser = await prisma.user.create({
        data: {
            email: 'owner@propflow.ai',
            role: 'OWNER',
            firstName: 'Alex',
            lastName: 'Owner',
            phone: '555-0100',
            passwordHash: await bcrypt.hash('password123', 10)
        }
    })

    const managerUser = await prisma.user.create({
        data: {
            email: 'manager@propflow.ai',
            role: 'PROPERTY_MANAGER',
            firstName: 'Manny',
            lastName: 'Manager',
            phone: '555-0101',
            passwordHash: await bcrypt.hash('password123', 10)
        }
    })

    // 2. Create Properties
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
    })

    const cozyCottage = await prisma.property.create({
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
    })

    // 3. Create Tenants
    const userAlice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            role: 'TENANT',
            firstName: 'Alice',
            lastName: 'Anderson',
            passwordHash: await bcrypt.hash('password123', 10)
        }
    })

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
    })

    await prisma.tenant.create({
        data: {
            propertyId: sunsetApts.id,
            name: 'Bob Builder',
            email: 'bob@example.com',
            phone: '555-0202',
            status: 'active',
            leaseStartDate: new Date('2024-06-01'),
            leaseEndDate: new Date('2025-06-01'),
            rentAmount: 3200,
            apartmentNumber: '1B',
            squareFootage: 1200,
            numberOfOccupants: 3,
        }
    })

    await prisma.tenant.create({
        data: {
            propertyId: sunsetApts.id,
            name: 'Pending Pete',
            email: 'pete@example.com',
            status: 'pending',
            rentAmount: 2600,
            apartmentNumber: '2B',
        }
    })

    await prisma.tenant.create({
        data: {
            propertyId: cozyCottage.id,
            name: 'Diana Prince',
            phone: '555-9999',
            status: 'active',
            leaseStartDate: new Date('2024-03-15'),
            leaseEndDate: new Date('2025-03-15'),
            rentAmount: 4500,
            squareFootage: 2400,
            numberOfOccupants: 4,
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
