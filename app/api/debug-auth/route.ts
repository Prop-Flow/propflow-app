
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        if (action === 'seed') {
            console.log('[API Seed] Starting seeding process...');

            // 1. Clean data
            await prisma.tenantUtilityCharge.deleteMany({});
            await prisma.utilityBill.deleteMany({});
            await prisma.communicationLog.deleteMany({});
            await prisma.complianceItem.deleteMany({});
            await prisma.document.deleteMany({});
            await prisma.tenant.deleteMany({});
            await prisma.property.deleteMany({});
            await prisma.user.deleteMany({});

            // 2. Create Users with Passwords
            const passwordHash = await bcrypt.hash('password123', 10);

            const ownerUser = await prisma.user.create({
                data: {
                    email: 'joel@propflow.ai',
                    role: 'OWNER',
                    firstName: 'Joel',
                    lastName: 'Torres',
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

            await prisma.user.create({
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
            // Need user for Alice? We created 'alice@example.com' above but didn't save var
            const userAlice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } });

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
                    userId: userAlice?.id
                }
            });

            // Create other tenants Bob/Charlie... (Simplified for speed)
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
            });

            await prisma.tenant.create({
                data: {
                    propertyId: sunsetApts.id,
                    name: 'Charlie Chaplin',
                    email: 'charlie@example.com',
                    status: 'active',
                    leaseStartDate: new Date('2023-01-01'),
                    leaseEndDate: new Date('2024-01-01'),
                    rentAmount: 2100,
                    apartmentNumber: '2A',
                    squareFootage: 850,
                    numberOfOccupants: 1,
                }
            });

            // 5. Create Utility Bills (Past 3 months)
            const months = [
                { period: '2024-10', cost: 450.00 },
                { period: '2024-11', cost: 480.50 },
                { period: '2024-12', cost: 520.25 },
            ];

            for (const m of months) {
                await prisma.utilityBill.create({
                    data: {
                        propertyId: sunsetApts.id,
                        billingPeriod: m.period,
                        utilityType: 'total',
                        totalCost: m.cost,
                        startDate: new Date(`${m.period}-01`),
                        endDate: new Date(`${m.period}-28`), // Rough
                        status: 'calculated',
                    }
                });
            }

            console.log('[API Seed] Finished.');
            return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
        }

        // Default Debug View with HTML Button
        const email = 'joel@propflow.ai';
        const user = await prisma.user.findUnique({ where: { email } });
        const userStatus = user ? '✅ User Found (Database is Ready)' : '❌ User Missing (Database needs Seeding)';
        const color = user ? 'green' : 'red';

        const html = `
        <html>
            <body style="font-family: system-ui; max-w-xl; margin: 40px auto; text-align: center; line-height: 1.5;">
                <h1>Debug Status</h1>
                <div style="padding: 20px; background: #f0f0f0; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="color: ${color}; font-size: 1.2em;">${userStatus}</strong>
                    <br/>
                    <small>Checked for: ${email}</small>
                    <br/>
                    <small>Database URL: ${process.env.DATABASE_URL}</small>
                    <br/>
                    <small id="netlify-url" data-url="${process.env.NETLIFY_DATABASE_URL || ''}">
                        Netlify URL: ${process.env.NETLIFY_DATABASE_URL ? 'FOUND' : 'MISSING'}
                    </small>
                    <br/>
                    <small style="color: ${process.env.AUTH_SECRET ? 'green' : 'red'};">
                        AUTH_SECRET: ${process.env.AUTH_SECRET ? '✅ CONFIGURED' : '❌ MISSING'}
                    </small>
                </div>
                
                ${!user ? `
                <div style="margin-top: 30px;">
                    <p>Click the button below to fix the database automatically:</p>
                    <a href="/api/debug-auth?action=seed" 
                       style="display: inline-block; background: #0070f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                       🛠️ FIX DATABASE & SEED DATA
                    </a>
                </div>
                ` : `
                <div style="margin-top: 30px;">
                    <p>You are ready to log in!</p>
                    <p>Email: <strong>owner@propflow.ai</strong><br>Password: <strong>password123</strong></p>
                    <a href="/login" style="color: #0070f3;">Go to Login Page &rarr;</a>
                </div>
                `}
            </body>
        </html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error: unknown) {
        // Safe error handling
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('[API Seed] Error:', error);
        return NextResponse.json({
            error: 'Internal Error',
            details: errorMessage,
            stack: errorStack
        }, { status: 500 });
    }
}
