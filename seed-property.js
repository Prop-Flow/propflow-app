
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for properties...');
    const count = await prisma.property.count();

    if (count === 0) {
        console.log('No properties found. Seeding one...');
        const prop = await prisma.property.create({
            data: {
                name: 'Sunset Heights Apartments',
                address: '123 Sunset Blvd',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90028',
                units: 24,
                buildingCode: 'SUN123'
            }
        });
        console.log('Created property:', prop.id);
    } else {
        console.log(`Found ${count} properties. Skipping seed.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
