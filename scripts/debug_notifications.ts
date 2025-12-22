import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');
    let user = await prisma.user.findFirst();

    if (!user) {
        console.log('No users found. Creating seed user...');
        user = await prisma.user.create({
            data: {
                email: 'demo@propflow.ai',
                role: 'OWNER',
                firstName: 'Demo',
                lastName: 'Owner',
            }
        });
        console.log('Created seed user:', user.id);
    } else {
        console.log('Found user:', user.id, user.email);
    }

    console.log('Attempting to create notification...');
    try {
        const notif = await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Welcome to PropFlow',
                message: 'Your notification system is not online.',
                type: 'success',
                link: '/settings'
            }
        });
        console.log('Success! Created notification:', notif.id);
    } catch (e) {
        console.error('Prisma creation failed:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
