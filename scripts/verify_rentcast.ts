import { RentCastClient } from '../lib/integrations/rentcast';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyRentCast() {
    console.log('--- Verifying RentCast Integration ---');

    const apiKey = process.env.RENTCAST_API_KEY;
    if (!apiKey) {
        console.error('❌ RENTCAST_API_KEY not found in .env.local');
        process.exit(1);
    }
    console.log('✅ API Key found:', apiKey.substring(0, 5) + '...');

    const client = new RentCastClient(apiKey);
    const testAddress = '5508 30th Ave NE, Seattle, WA 98105'; // Known address

    try {
        console.log(`\nFetching Rent Estimate for: ${testAddress}...`);
        const estimate = await client.getRentEstimate({ address: testAddress });

        console.log('✅ Rent Estimate Fetch Successful!');
        console.log({
            rent: estimate.rent,
            range: `${estimate.rentRangeLow} - ${estimate.rentRangeHigh}`,
            bedrooms: estimate.bedrooms ?? 'N/A',
            bathrooms: estimate.bathrooms ?? 'N/A'
        });

        if (estimate.rent > 0) {
            console.log('\n✅ Verification PASSED: API is returning valid data.');
        } else {
            console.error('\n⚠️ Verification WARNING: API returned 0 rent (might be valid for some addresses but unusual).');
        }

    } catch (error: any) {
        console.error('\n❌ Verification FAILED:', error.message);
        if (error.res) {
            console.error('Status:', error.res.status);
            const body = await error.res.text();
            console.error('Body:', body);
        }
    }
}

verifyRentCast();
