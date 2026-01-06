
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'dev@propflow.ai';
    const password = 'sharktank101!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        console.log('Dev user already exists. Updating password...');
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash: hashedPassword,
                role: 'OWNER'
            }
        });
    } else {
        console.log('Creating dev user...');
        await prisma.user.create({
            data: {
                email,
                name: 'Developer Mode',
                firstName: 'Developer',
                lastName: '(Mode)',
                role: 'OWNER',
                passwordHash: hashedPassword
            }
        });
    }

    // Seed Manager
    const managerEmail = 'manager@propflow.ai';
    const existingManager = await prisma.user.findUnique({ where: { email: managerEmail } });

    if (existingManager) {
        console.log('Manager user already exists. Updating password...');
        await prisma.user.update({
            where: { email: managerEmail },
            data: {
                passwordHash: hashedPassword,
                role: 'PROPERTY_MANAGER'
            }
        });
    } else {
        console.log('Creating manager user...');
        await prisma.user.create({
            data: {
                email: managerEmail,
                name: 'Manager Mode',
                firstName: 'Property',
                lastName: 'Manager',
                role: 'PROPERTY_MANAGER',
                passwordHash: hashedPassword
            }
        });
    }

    console.log('✅ Dev user seeded successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
