
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'demov1@propflow.ai';
    const password = 'sharktank101';

    console.log(`Resetting password for ${email} to ${password}...`);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            firstName: 'Demo',
            lastName: 'V1',
            name: 'Demo V1',
            role: 'PROPERTY_MANAGER'
        },
        create: {
            email,
            passwordHash,
            firstName: 'Demo',
            lastName: 'V1',
            name: 'Demo V1',
            role: 'PROPERTY_MANAGER'
        }
    });

    console.log('User reset successfully:', JSON.stringify(user, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
