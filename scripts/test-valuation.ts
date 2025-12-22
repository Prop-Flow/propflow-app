/**
 * Test script for property valuation system
 * Run with: npx ts-node scripts/test-valuation.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testValuation() {
    console.log('🧪 Testing Property Valuation System\n');

    try {
        // Get first property
        const property = await prisma.property.findFirst({
            include: {
                financials: {
                    include: {
                        income: true,
                        expenses: true,
                        debts: true
                    }
                }
            }
        });

        if (!property) {
            console.log('❌ No properties found. Please create a property first.');
            return;
        }

        console.log(`📍 Testing with property: ${property.name}`);
        console.log(`   ID: ${property.id}\n`);

        // Test 1: Calculate Valuation
        console.log('Test 1: Calculate Property Valuation');
        console.log('=====================================');

        const valuationResponse = await fetch(`http://localhost:3000/api/properties/${property.id}/valuation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!valuationResponse.ok) {
            console.log(`❌ Valuation calculation failed: ${valuationResponse.status}`);
            const error = await valuationResponse.text();
            console.log(`   Error: ${error}\n`);
        } else {
            const valuation = await valuationResponse.json();
            console.log('✅ Valuation calculated successfully!');
            console.log(`   Estimated Value: $${valuation.estimatedValue.toLocaleString()}`);
            console.log(`   Cap Rate: ${valuation.marketCapRate}%`);
            console.log(`   Annual NOI: $${valuation.annualNOI.toLocaleString()}`);
            console.log(`   Confidence: ${valuation.confidence}`);

            if (valuation.purchasePrice) {
                console.log(`   Purchase Price: $${valuation.purchasePrice.toLocaleString()}`);
                console.log(`   Total Appreciation: $${valuation.totalAppreciation.toLocaleString()}`);
                console.log(`   Annual Appreciation Rate: ${valuation.appreciationRate.toFixed(2)}%`);
            }
            console.log('');
        }

        // Test 2: Get Valuation History
        console.log('Test 2: Get Valuation History');
        console.log('==============================');

        const historyResponse = await fetch(`http://localhost:3000/api/properties/${property.id}/valuation`);

        if (!historyResponse.ok) {
            console.log(`❌ Failed to fetch valuation history: ${historyResponse.status}\n`);
        } else {
            const history = await historyResponse.json();
            console.log(`✅ Found ${history.history?.length || 0} valuation records`);
            if (history.current) {
                console.log(`   Latest: $${history.current.estimatedValue.toLocaleString()} (${new Date(history.current.createdAt).toLocaleDateString()})`);
            }
            console.log('');
        }

        // Test 3: Calculate Projections
        console.log('Test 3: Calculate 5-Year Projections');
        console.log('====================================');

        const projectionsResponse = await fetch(`http://localhost:3000/api/properties/${property.id}/projections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appreciationRate: 3.0,
                incomeGrowthRate: 2.0,
                expenseGrowthRate: 3.0,
                projectionYears: 5
            })
        });

        if (!projectionsResponse.ok) {
            console.log(`❌ Projections calculation failed: ${projectionsResponse.status}`);
            const error = await projectionsResponse.text();
            console.log(`   Error: ${error}\n`);
        } else {
            const projections = await projectionsResponse.json();
            console.log('✅ Projections calculated successfully!');
            console.log(`   Projection Years: ${projections.projectionYears}`);
            console.log(`   Assumptions:`);
            console.log(`     - Appreciation: ${projections.assumedAppreciation}%`);
            console.log(`     - Income Growth: ${projections.assumedIncomeGrowth}%`);
            console.log(`     - Expense Growth: ${projections.assumedExpenseGrowth}%`);
            console.log(`\n   Year-by-Year Projections:`);

            const yearlyData = projections.yearlyProjections as any[];
            yearlyData.forEach((year: any) => {
                console.log(`   Year ${year.year}:`);
                console.log(`     Value: $${year.value.toLocaleString()}`);
                console.log(`     NOI: $${year.noi.toLocaleString()}`);
                console.log(`     Cash Flow: $${year.cashFlow.toLocaleString()}`);
                console.log(`     Equity: $${year.equity.toLocaleString()}`);
            });

            console.log(`\n   5-Year Summary:`);
            console.log(`     Projected Sale Value: $${projections.projectedSaleValue?.toLocaleString() || 'N/A'}`);
            console.log(`     Projected Equity: $${projections.projectedEquity?.toLocaleString() || 'N/A'}`);
            console.log(`     Projected ROI: ${projections.projectedROI?.toFixed(2) || 'N/A'}%`);
            console.log('');
        }

        console.log('🎉 All tests completed!\n');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testValuation();
