
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'owner@example.com';
    const password = 'password123';

    console.log(`Resetting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { email },
        data: {
            passwordHash: hashedPassword
        }
    });

    console.log(`Password for ${email} has been set to: ${password}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
