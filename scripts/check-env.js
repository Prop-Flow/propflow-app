const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env');

console.log('Checking .env at:', envPath);

if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found!');
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log('--- Environment Variables in .env ---');
const keys = Object.keys(envConfig);
keys.forEach(key => {
    const value = envConfig[key];
    const isPresent = !!value;
    const length = value ? value.length : 0;
    console.log(`${key}: ${isPresent ? 'Present' : 'Missing'} (Length: ${length})`);

    if (key === 'GCP_PRIVATE_KEY') {
        console.log(`  -> Starts with '-----BEGIN PRIVATE KEY-----': ${value.startsWith('-----BEGIN PRIVATE KEY-----')}`);
        console.log(`  -> Contains newlines: ${value.includes('\n') || value.includes('\\n')}`);
    }
});
console.log('-------------------------------------');
