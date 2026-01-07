import fs from 'fs';
import path from 'path';
import { parseDocument } from '@/lib/ai/document-parser';
import dotenv from 'dotenv';

// Load environment variables (try .env.local first, then .env)
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// --- Constants ---
const MOCK_DIR = path.join(process.cwd(), 'mocks');
const LEASE_DIR = path.join(MOCK_DIR, 'lease_agreements');
const RENT_ROLL_DIR = path.join(MOCK_DIR, 'rent_rolls');

// --- Helper Types ---
interface ComparisonResult {
    fileName: string;
    documentType: string;
    success: boolean;
    accuracy: number;
    discrepancies: string[];
}

// --- Comparison Logic ---

function compareLease(truth: any, extracted: any): ComparisonResult {
    const discrepancies: string[] = [];
    let matchCount = 0;
    const fieldsToCheck = [
        { key: 'rent', extractedKey: 'rentAmount', type: 'number', tolerance: 0.01 },
        { key: 'securityDeposit', extractedKey: 'securityDeposit', type: 'number', tolerance: 0.01 },
        { key: 'startDate', extractedKey: 'leaseStartDate', type: 'date' },
        { key: 'endDate', extractedKey: 'leaseEndDate', type: 'date' },
        // Tenant name and address can be fuzzy, checking strict equality for now or inclusion
        { key: 'tenant', extractedKey: 'name', type: 'string' },
        { key: 'address', extractedKey: 'propertyAddress', type: 'string_fuzzy' }
    ];

    for (const field of fieldsToCheck) {
        const valTruth = truth[field.key];
        // For leases, extractedData is ExtractedTenantData, generally flat
        const valExtracted = extracted[field.extractedKey];

        if (valExtracted === undefined || valExtracted === null) {
            discrepancies.push(`Missing field: ${field.extractedKey} (Expected: ${valTruth})`);
            continue;
        }

        let isMatch = false;

        if (field.type === 'number') {
            const numTruth = Number(valTruth);
            const numExtracted = Number(valExtracted);
            if (Math.abs(numTruth - numExtracted) <= (field.tolerance || 0)) {
                isMatch = true;
            } else {
                discrepancies.push(`Mismatch ${field.key}: Expected ${numTruth}, Got ${numExtracted}`);
            }
        } else if (field.type === 'date') {
            const dateTruth = new Date(valTruth).toISOString().split('T')[0];
            const dateExtracted = new Date(valExtracted).toISOString().split('T')[0];
            if (dateTruth === dateExtracted) {
                isMatch = true;
            } else {
                discrepancies.push(`Mismatch ${field.key}: Expected ${dateTruth}, Got ${dateExtracted}`);
            }
        } else if (field.type === 'string') {
            if (String(valTruth).trim() === String(valExtracted).trim()) {
                isMatch = true;
            } else {
                discrepancies.push(`Mismatch ${field.key}: Expected "${valTruth}", Got "${valExtracted}"`);
            }
        } else if (field.type === 'string_fuzzy') {
            // Simple check: is truth contained in extracted or vice-versa?
            const s1 = String(valTruth).toLowerCase();
            const s2 = String(valExtracted).toLowerCase();
            if (s1.includes(s2) || s2.includes(s1)) {
                isMatch = true;
            } else {
                discrepancies.push(`Mismatch ${field.key}: Expected ~"${valTruth}", Got "${valExtracted}"`);
            }
        }

        if (isMatch) matchCount++;
    }

    const accuracy = matchCount / fieldsToCheck.length;
    return {
        fileName: truth.fileName,
        documentType: 'lease',
        success: accuracy > 0.8, // 80% threshold
        accuracy,
        discrepancies
    };
}

function compareRentRoll(truth: any, extracted: any): ComparisonResult {
    const discrepancies: string[] = [];
    let matchCount = 0;

    // RentRollData in parser:
    // totals: { totalMonthlyRent?: number; totalDeposits?: number; }
    // units: Array... 
    // We will compare totals and calculate occupancy from units

    const fieldsToCheck = [
        { key: 'totalMonthlyRent', path: 'totals.totalMonthlyRent', type: 'number', tolerance: 1.0 },
        { key: 'totalSecurityDeposit', path: 'totals.totalDeposits', type: 'number', tolerance: 1.0 },
        { key: 'occupancyRate', type: 'calculated_occupancy', tolerance: 0.05 }
    ];

    for (const field of fieldsToCheck) {
        const valTruth = truth[field.key];
        let valExtracted: any;

        if (field.type === 'calculated_occupancy') {
            const units = extracted.units || [];
            if (units.length === 0) {
                valExtracted = 0;
            } else {
                const occupied = units.filter((u: any) => u.status === 'Occupied' || (u.tenantName && u.tenantName.trim() !== '')).length;
                valExtracted = occupied / units.length;
            }
        } else {
            // Safe access nested path
            const parts = field.path!.split('.');
            valExtracted = extracted;
            for (const part of parts) {
                valExtracted = valExtracted ? valExtracted[part] : undefined;
            }
        }

        if (valExtracted === undefined || valExtracted === null) {
            discrepancies.push(`Missing field: ${field.key} (Expected: ${valTruth})`);
            continue;
        }

        let isMatch = false;

        if (field.type === 'number' || field.type === 'calculated_occupancy') {
            const numTruth = Number(valTruth);
            const numExtracted = Number(valExtracted);
            if (Math.abs(numTruth - numExtracted) <= (field.tolerance || 0)) {
                isMatch = true;
            } else {
                discrepancies.push(`Mismatch ${field.key}: Expected ${numTruth}, Got ${numExtracted}`);
            }
        }

        if (isMatch) matchCount++;
    }

    const accuracy = matchCount / fieldsToCheck.length;
    return {
        fileName: truth.fileName,
        documentType: 'rent_roll',
        success: accuracy > 0.9,
        accuracy,
        discrepancies
    };
}

// --- Main Verification Loop ---

async function verify() {
    console.log('Starting Verification Loop...\n');
    const results: ComparisonResult[] = [];

    // 1. Verify Leases
    const leaseFiles = fs.readdirSync(LEASE_DIR).filter(f => f.endsWith('.md'));
    for (const file of leaseFiles) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(path.join(LEASE_DIR, file));
        const jsonPath = path.join(LEASE_DIR, file.replace('.md', '.json'));

        if (!fs.existsSync(jsonPath)) {
            console.warn(`No truth JSON found for ${file}, skipping.`);
            continue;
        }
        const truth = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        try {
            const buffer = Buffer.from(content);
            const parsed = await parseDocument(buffer, 'text/markdown');
            const result = compareLease(truth, parsed.extractedData);
            results.push(result);
        } catch (error) {
            console.error(`Failed to parse ${file}:`, error);
            results.push({
                fileName: file,
                documentType: 'lease',
                success: false,
                accuracy: 0,
                discrepancies: [`Exception: ${error instanceof Error ? error.message : String(error)}`]
            });
        }
    }

    // 2. Verify Rent Rolls
    const rentRollFiles = fs.readdirSync(RENT_ROLL_DIR).filter(f => f.endsWith('.csv'));
    for (const file of rentRollFiles) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(path.join(RENT_ROLL_DIR, file));
        const jsonPath = path.join(RENT_ROLL_DIR, file.replace('.csv', '.json'));

        if (!fs.existsSync(jsonPath)) {
            console.warn(`No truth JSON found for ${file}, skipping.`);
            continue;
        }
        const truth = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        try {
            const buffer = Buffer.from(content);
            const parsed = await parseDocument(buffer, 'text/csv');
            const result = compareRentRoll(truth, parsed.extractedData);
            results.push(result);
        } catch (error) {
            console.error(`Failed to parse ${file}:`, error);
            results.push({
                fileName: file,
                documentType: 'rent_roll',
                success: false,
                accuracy: 0,
                discrepancies: [`Exception: ${error instanceof Error ? error.message : String(error)}`]
            });
        }
    }

    // --- Report ---
    console.log('\n--- VERIFICATION REPORT ---\n');

    let totalAccuracy = 0;

    for (const res of results) {
        totalAccuracy += res.accuracy;
        const status = res.success ? 'PASS' : 'FAIL';
        console.log(`[${status}] ${res.fileName} (Accuracy: ${(res.accuracy * 100).toFixed(1)}%)`);
        if (res.discrepancies.length > 0) {
            res.discrepancies.forEach(d => console.log(`  - ${d}`));
        }
    }

    const avgAccuracy = results.length > 0 ? totalAccuracy / results.length : 0;
    console.log(`\nOverall Accuracy: ${(avgAccuracy * 100).toFixed(1)}%`);
}

verify().catch(console.error);
