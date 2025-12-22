
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        const properties = await prisma.property.findMany({
            take: 1
        });
        console.log('Successfully connected!');
        console.log(`Found ${properties.length} properties.`);
        if (properties.length > 0) {
            console.log('First property:', properties[0].name);
        }

        console.log('Checking Account table...');
        try {
            const accounts = await prisma.account.findMany({ take: 1 });
            console.log(`Found ${accounts.length} accounts.`);
        } catch (e) {
            console.error('Failed to query Account table. It might be missing.', e);
        }
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
