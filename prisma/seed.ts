
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean existing data used for testing
    // Order matters due to foreign keys
    await prisma.tenantUtilityCharge.deleteMany({})
    await prisma.utilityBill.deleteMany({})
    await prisma.communicationLog.deleteMany({})
    await prisma.complianceItem.deleteMany({})
    await prisma.document.deleteMany({})
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
        }
    })

    const managerUser = await prisma.user.create({
        data: {
            email: 'manager@propflow.ai',
            role: 'PROPERTY_MANAGER',
            firstName: 'Manny',
            lastName: 'Manager',
            phone: '555-0101',
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
    // Sunset Apts Tenants
    // Create user for Alice first
    const userAlice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            role: 'TENANT',
            firstName: 'Alice',
            lastName: 'Anderson'
        }
    })

    const tenantAlice = await prisma.tenant.create({
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

    const tenantBob = await prisma.tenant.create({
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

    const tenantCharlie = await prisma.tenant.create({
        data: {
            propertyId: sunsetApts.id,
            name: 'Charlie Chaplin',
            email: 'charlie@example.com',
            status: 'active',
            leaseStartDate: new Date('2023-01-01'),
            leaseEndDate: new Date('2024-01-01'), // Month-to-month now
            rentAmount: 2100,
            apartmentNumber: '2A',
            squareFootage: 850,
            numberOfOccupants: 1,
        }
    })

    // Pending Tenant
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

    // Cozy Cottage Tenant
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

    // 4. Create Documents
    await prisma.document.create({
        data: {
            tenantId: tenantAlice.id,
            type: 'lease',
            name: 'Lease Agreement 2024.pdf',
            status: 'approved',
            fileUrl: '/mock/lease.pdf',
            processingStatus: 'completed'
        }
    })

    await prisma.document.create({
        data: {
            tenantId: tenantBob.id,
            type: 'w9',
            name: 'W9 Form.pdf',
            status: 'pending',
            processingStatus: 'pending'
        }
    })

    // 5. Create Communications
    await prisma.communicationLog.create({
        data: {
            tenantId: tenantAlice.id,
            channel: 'sms',
            direction: 'outbound',
            message: 'Reminder: Rent is due tomorrow.',
            status: 'delivered',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
        }
    })

    await prisma.communicationLog.create({
        data: {
            tenantId: tenantAlice.id,
            channel: 'email',
            direction: 'inbound',
            message: 'Hi, is it possible to pay online?',
            status: 'received',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
        }
    })

    // 6. Create Compliance Items
    await prisma.complianceItem.create({
        data: {
            propertyId: sunsetApts.id,
            type: 'inspection',
            title: 'Annual Fire Inspection',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days out
            priority: 'high',
            status: 'pending'
        }
    })

    await prisma.complianceItem.create({
        data: {
            tenantId: tenantBob.id,
            type: 'insurance_renewal',
            title: 'Renters Insurance Expiring',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days out
            priority: 'medium',
            status: 'pending'
        }
    })

    // 7. Create Utility Bills (Past 3 months for Sunset Apts)
    const months = [
        { period: '2024-10', cost: 450.00 },
        { period: '2024-11', cost: 480.50 },
        { period: '2024-12', cost: 520.25 },
    ]

    for (const m of months) {
        const bill = await prisma.utilityBill.create({
            data: {
                propertyId: sunsetApts.id,
                billingPeriod: m.period,
                utilityType: 'total',
                totalCost: m.cost,
                startDate: new Date(`${m.period}-01`),
                endDate: new Date(`${m.period}-28`), // Rough approx
                status: 'calculated',
            }
        })

        // Create Charges (Simplified distribution logic just for mock)
        // Alice (1A, 800sqft, 1 occ)
        // Bob (1B, 1200sqft, 3 occ)
        // Charlie (2A, 850sqft, 1 occ)
        // Total Sqft: 2850. Total Occ: 5.

        // Just hardcode roughly correct proportions for visual check
        await prisma.tenantUtilityCharge.createMany({
            data: [
                {
                    utilityBillId: bill.id,
                    tenantId: tenantAlice.id,
                    chargeAmount: m.cost * 0.25, // approx
                    squareFootageRatio: 0.28,
                    occupancyRatio: 0.2,
                    squareFootageCost: 0,
                    occupancyCost: 0,
                    tenantSquareFootage: 800,
                    tenantOccupants: 1
                },
                {
                    utilityBillId: bill.id,
                    tenantId: tenantBob.id,
                    chargeAmount: m.cost * 0.45, // approx
                    squareFootageRatio: 0.42,
                    occupancyRatio: 0.6,
                    squareFootageCost: 0,
                    occupancyCost: 0,
                    tenantSquareFootage: 1200,
                    tenantOccupants: 3
                },
                {
                    utilityBillId: bill.id,
                    tenantId: tenantCharlie.id,
                    chargeAmount: m.cost * 0.30, // approx
                    squareFootageRatio: 0.3,
                    occupancyRatio: 0.2,
                    squareFootageCost: 0,
                    occupancyCost: 0,
                    tenantSquareFootage: 850,
                    tenantOccupants: 1
                }
            ]
        })
    }

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
