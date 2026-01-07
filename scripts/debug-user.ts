
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const name = 'Joel Torres';
    console.log(`Searching for user with name: ${name}`);
    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: name,
                mode: 'insensitive',
            },
        },
    });

    if (user) {
        console.log('User found:');
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log('User not found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
