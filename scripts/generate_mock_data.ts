import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// --- Constants & Types ---

const MOCK_DIR = path.join(process.cwd(), 'mocks');
const LEASE_DIR = path.join(MOCK_DIR, 'lease_agreements');
const RENT_ROLL_DIR = path.join(MOCK_DIR, 'rent_rolls');

// Ensure directories exist
if (!fs.existsSync(MOCK_DIR)) fs.mkdirSync(MOCK_DIR);
if (!fs.existsSync(LEASE_DIR)) fs.mkdirSync(LEASE_DIR);
if (!fs.existsSync(RENT_ROLL_DIR)) fs.mkdirSync(RENT_ROLL_DIR);

// --- Interface for Truth Data ---
interface LeaseData {
    fileName: string;
    landlord: string;
    tenant: string;
    address: string;
    startDate: string;
    endDate: string;
    rent: number;
    securityDeposit: number;
}

interface RentRollData {
    fileName: string;
    totalMonthlyRent: number;
    totalSecurityDeposit: number;
    occupancyRate: number;
}

// --- Generators ---

function generateLeaseAgreement(id: number): { content: string; data: LeaseData } {
    const landlord = faker.company.name();
    const tenant = faker.person.fullName();
    const address = faker.location.streetAddress(true);
    const city = faker.location.city();
    const state = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode();

    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const rent = parseFloat(faker.finance.amount({ min: 1200, max: 5000, dec: 2 }));
    const securityDeposit = rent * (Math.random() > 0.5 ? 1 : 1.5);
    const lateFee = rent * 0.05;

    const content = `# RESIDENTIAL LEASE AGREEMENT

**1. PARTIES**
This Lease Agreement ("Lease") is made and entered into on ${faker.date.recent().toLocaleDateString()}, by and between:
**Landlord:** ${landlord} ("Landlord")
**Tenant:** ${tenant} ("Tenant")

**2. PROPERTY**
Landlord leases to Tenant the following real property:
**Address:** ${address}, ${city}, ${state} ${zip} ("Premises")

**3. TERM**
The term of this Lease shall begin on ${startDate.toLocaleDateString()} and end on ${endDate.toLocaleDateString()}.

**4. RENT**
Tenant agrees to pay Landlord monthly rent in the amount of $${rent.toFixed(2)}.
Rent is due on the 1st day of each month.
First month's rent is required at signing.

**5. SECURITY DEPOSIT**
Tenant shall deposit with Landlord the sum of $${securityDeposit.toFixed(2)} as a security deposit to secure Tenant's performance of obligations under this Lease.

**6. LATE FEES**
If rent is not paid by the 5th day of the month, Tenant agrees to pay a late fee of $${lateFee.toFixed(2)}.

**7. UTILITIES**
Tenant shall be responsible for: Electricity, Gas, Internet.
Landlord shall be responsible for: Water, Trash.

**8. OCCUPANTS**
The Premises shall be occupied only by the Tenant and the following individuals:
- ${faker.person.fullName()} (Occupant)

**9. SIGNATURES**

___________________________  Date: __________
${landlord} (Landlord)

___________________________  Date: __________
${tenant} (Tenant)
  `;

    return {
        content,
        data: {
            fileName: `lease_${id}.md`,
            landlord,
            tenant,
            address: `${address}, ${city}, ${state} ${zip}`,
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            rent,
            securityDeposit
        }
    };
}

function generateRentRoll(id: number): { content: string; data: RentRollData } {
    // Header
    const headers = [
        'Unit',
        'Tenant Name',
        'Status',
        'Lease Start',
        'Lease End',
        'Monthly Rent',
        'Market Rent',
        'Security Deposit',
        'Balance Due',
        'Move In Date'
    ];

    const rows = [];
    const unitCount = faker.number.int({ min: 10, max: 30 });

    let totalMonthlyRent = 0;
    let totalSecurityDeposit = 0;
    let occupiedCount = 0;

    for (let i = 1; i <= unitCount; i++) {
        const isOccupied = Math.random() > 0.1; // 90% occupancy
        const unit = `${faker.number.int({ min: 1, max: 5 })}0${faker.number.int({ min: 1, max: 9 })}`;

        if (isOccupied) {
            occupiedCount++;
            const tenant = faker.person.fullName();
            const marketRent = parseFloat(faker.finance.amount({ min: 1500, max: 3000, dec: 2 }));
            // Actual rent might be slightly different than market
            const rent = marketRent + faker.number.float({ min: -100, max: 100 });

            const moveIn = faker.date.past({ years: 2 });
            const leaseStart = moveIn; // Simplified
            const leaseEnd = new Date(moveIn);
            leaseEnd.setFullYear(leaseEnd.getFullYear() + 1);

            const deposit = rent;
            // Some tenants owe money
            const balance = Math.random() > 0.8 ? faker.number.float({ min: 0, max: 500 }) : 0;

            totalMonthlyRent += rent;
            totalSecurityDeposit += deposit;

            rows.push([
                unit,
                tenant,
                'Occupied',
                leaseStart.toLocaleDateString(),
                leaseEnd.toLocaleDateString(),
                rent.toFixed(2),
                marketRent.toFixed(2),
                deposit.toFixed(2),
                balance.toFixed(2),
                moveIn.toLocaleDateString()
            ].join(','));
        } else {
            const marketRent = parseFloat(faker.finance.amount({ min: 1500, max: 3000, dec: 2 }));
            rows.push([
                unit,
                '',
                'Vacant',
                '',
                '',
                '0.00',
                marketRent.toFixed(2),
                '0.00',
                '0.00',
                ''
            ].join(','));
        }
    }

    return {
        content: [headers.join(','), ...rows].join('\n'),
        data: {
            fileName: `rent_roll_${id}.csv`,
            totalMonthlyRent: parseFloat(totalMonthlyRent.toFixed(2)),
            totalSecurityDeposit: parseFloat(totalSecurityDeposit.toFixed(2)),
            occupancyRate: parseFloat((occupiedCount / unitCount).toFixed(2))
        }
    };
}

// --- Main Execution ---

async function main() {
    console.log('Generating Mock Data...');

    // Generate 5 Leases
    for (let i = 1; i <= 5; i++) {
        const { content, data } = generateLeaseAgreement(i);
        const filename = `lease_${i}`;
        fs.writeFileSync(path.join(LEASE_DIR, `${filename}.md`), content);
        fs.writeFileSync(path.join(LEASE_DIR, `${filename}.json`), JSON.stringify(data, null, 2));
        console.log(`Generated: ${filename}.md and .json`);
    }

    // Generate 3 Rent Rolls
    for (let i = 1; i <= 3; i++) {
        const { content, data } = generateRentRoll(i);
        const filename = `rent_roll_${i}`;
        fs.writeFileSync(path.join(RENT_ROLL_DIR, `${filename}.csv`), content);
        fs.writeFileSync(path.join(RENT_ROLL_DIR, `${filename}.json`), JSON.stringify(data, null, 2));
        console.log(`Generated: ${filename}.csv and .json`);
    }

    console.log('Done!');
}

main().catch(console.error);
