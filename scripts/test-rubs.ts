
import { calculateRubs, TenantForBilling } from '../lib/billing/rubs-calculator';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

async function runTests() {
    console.log("Running R.U.B.S Calculator Tests...");

    // Test Case 1: Equal Distribution
    // 2 tenants, identical stats. Should split 50/50.
    const tenants1: TenantForBilling[] = [
        { id: 't1', squareFootage: 1000, numberOfOccupants: 2 },
        { id: 't2', squareFootage: 1000, numberOfOccupants: 2 }
    ];
    const totalCost1 = 10000; // $100.00
    const result1 = calculateRubs(totalCost1, tenants1);

    assert(result1.length === 2, "Should return 2 results");
    assert(result1[0].chargeAmount === 5000, "Tenant 1 should pay 50%");
    assert(result1[1].chargeAmount === 5000, "Tenant 2 should pay 50%");

    // Test Case 2: Configured Weights (60% sqft, 40% occupants)
    // T1: 2000sqft, 1 occ
    // T2: 1000sqft, 3 occ
    // Total SqFt: 3000. T1 has 2/3 (66.6%), T2 has 1/3 (33.3%)
    // Total Occ: 4. T1 has 1/4 (25%), T2 has 3/4 (75%)
    // Cost: $1000 (100000 cents)
    // SqFt Portion ($600): T1 gets $400, T2 gets $200
    // Occ Portion ($400): T1 gets $100, T2 gets $300
    // Total: T1 $500, T2 $500 
    // Wait, let's verify math: 
    // T1 SqFt Cost = 0.6 * 100000 * (2000/3000) = 40000
    // T1 Occ Cost = 0.4 * 100000 * (1/4) = 10000
    // T1 Total = 50000
    // T2 SqFt Cost = 0.6 * 100000 * (1000/3000) = 20000
    // T2 Occ Cost = 0.4 * 100000 * (3/4) = 30000
    // T2 Total = 50000
    // Coincidentally equal! Let's change inputs to make them unequal.

    // T1: 1000 sqft, 1 occ
    // T2: 1000 sqft, 3 occ
    // SqFt (60%): Split 50/50 ($300 each)
    // Occ (40%): T1 (1/4) $100, T2 (3/4) $300
    // T1 Total: 400. T2 Total: 600.
    const tenants2: TenantForBilling[] = [
        { id: 't1', squareFootage: 1000, numberOfOccupants: 1 },
        { id: 't2', squareFootage: 1000, numberOfOccupants: 3 }
    ];
    const result2 = calculateRubs(100000, tenants2);

    assert(Math.abs(result2[0].chargeAmount - 40000) < 2, `Tenant 1 should pay ~40000, got ${result2[0].chargeAmount}`);
    assert(Math.abs(result2[1].chargeAmount - 60000) < 2, `Tenant 2 should pay ~60000, got ${result2[1].chargeAmount}`);

    console.log("All manual tests passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
