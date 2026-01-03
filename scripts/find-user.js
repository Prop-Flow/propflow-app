
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'demov1@propflow.ai' }
    });

    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User not found in database.');

        // Let's also list first 5 users
        const users = await prisma.user.findMany({ take: 5 });
        console.log('First 5 users:', JSON.stringify(users, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
