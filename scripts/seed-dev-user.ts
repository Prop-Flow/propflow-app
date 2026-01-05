
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
