
const bcrypt = require('bcryptjs');

const hashes = [
    { name: 'demov1', hash: '$2b$10$NQ2dQMAYiyLfiVCEHaXCqOXXXhID7VCuO3FQI70MmW9EeXqfunjaa' }
];

const passwords = [
    'password123',
    'sharktank101!',
    'propflow123',
    'admin123',
    '123456'
];

async function main() {
    for (const h of hashes) {
        console.log(`Checking hashes for ${h.name}...`);
        for (const p of passwords) {
            const match = await bcrypt.compare(p, h.hash);
            if (match) {
                console.log(`MATCH FOUND: Password for ${h.name} is "${p}"`);
            }
        }
    }
}

main().catch(console.error);
