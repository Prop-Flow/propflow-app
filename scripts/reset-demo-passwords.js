const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetDemoPasswords() {
    const password = 'sharktank101';
    const hashedPassword = await bcrypt.hash(password, 10);

    const demoEmails = ['demov1@propflow.ai', 'demov2@propflow.ai', 'demov3@propflow.ai'];

    for (const email of demoEmails) {
        const result = await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });
        console.log(`✓ Reset password for ${email} (${result.name})`);
    }

    console.log('\nAll demo accounts now use password: sharktank101');
}

resetDemoPasswords()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
