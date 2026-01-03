
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'demov1@propflow.ai';
    const password = 'sharktank101';

    console.log(`[Test] Checking credentials for ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error('[Test] FAIL: User not found');
        return;
    }

    console.log(`[Test] User found. Hash: ${user.passwordHash ? 'Present' : 'Missing'}`);

    if (!user.passwordHash) {
        console.error('[Test] FAIL: no password hash');
        return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (match) {
        console.log('[Test] SUCCESS: Password matches! Credentials are valid.');
    } else {
        console.error('[Test] FAIL: Password comparison returned false.');

        // Debug: what if we just hash 'password123' now?
        const newHash = await bcrypt.hash(password, 10);
        console.log(`[Test] Debug: Test hash for 'password123': ${newHash}`);
        console.log(`[Test] Debug: Stored hash: ${user.passwordHash}`);
    }
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
