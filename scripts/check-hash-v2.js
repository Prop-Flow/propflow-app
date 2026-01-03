
const bcrypt = require('bcryptjs');

const hash = '$2b$10$NQ2dQMAYiyLfiVCEHaXCqOXXXhID7VCuO3FQI70MmW9EeXqfunjaa';

const passwords = [
    'password123',
    'sharktank101!',
    'propflow123',
    'admin123',
    '123456',
    'password',
    'Propflow123!',
    'SharkTank101!',
    'SharkTank!',
    'sharktank!',
    'propflow!',
    'Propflow!',
    'sharktank101',
    'SharkTank101',
    'demov1',
    'demo123',
    'propflow'
];

async function main() {
    console.log(`Checking hashes for demov1...`);
    for (const p of passwords) {
        try {
            const match = await bcrypt.compare(p, hash);
            if (match) {
                console.log(`MATCH FOUND: Password is "${p}"`);
                return;
            }
        } catch (e) {
            console.error(`Error checking ${p}:`, e.message);
        }
    }
    console.log('No matches found.');
}

main().catch(console.error);
