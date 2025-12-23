
import { prisma } from '@/lib/prisma';

async function main() {
    const email = 'test.signup@example.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log('User found:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
