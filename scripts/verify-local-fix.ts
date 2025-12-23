
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Testing connection via lib/prisma...');

    // 1. Try to connect
    try {
        await prisma.$connect();
        console.log('✅ Connected to database successfully.');
    } catch (e) {
        console.error('❌ Failed to connect:', e);
        process.exit(1);
    }

    // 2. Check for owner user
    const email = 'owner@propflow.ai';
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        console.log(`✅ User ${email} FOUND.`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Hash Present: ${!!user.passwordHash}`);

        // 3. Verify Password
        if (user.passwordHash) {
            const valid = await bcrypt.compare('password123', user.passwordHash);
            if (valid) {
                console.log('✅ Password "password123" IS VALID.');
            } else {
                console.log('❌ Password "password123" is INVALID.');
            }
        }
    } else {
        console.log(`⚠️ User ${email} NOT FOUND.`);
        console.log('   (This is expected if you haven\'t clicked "FIX DATABASE" in the browser yet)');
        console.log('   But the connection itself is WORKING.');
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
