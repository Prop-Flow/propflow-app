/**
 * Seed script for property valuation testing
 * Creates a property with complete financial data to test valuation system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedValuationTest() {
    console.log('🌱 Seeding property valuation test data...\n');

    try {
        // Find or create a test property
        let property = await prisma.property.findFirst({
            where: { name: 'Sunset Heights Apartments' }
        });

        if (!property) {
            property = await prisma.property.create({
                data: {
                    name: 'Sunset Heights Apartments',
                    address: '123 Main St',
                    city: 'Austin',
                    state: 'TX',
                    zipCode: '78701',
                    units: 12,
                    propertyType: 'MULTI_FAMILY',
                    purchasePrice: 1500000, // $1.5M purchase price
                    purchaseDate: new Date('2020-01-15'), // Purchased ~5 years ago
                }
            });
            console.log(`✅ Created property: ${property.name}`);
        } else {
            // Update with purchase data
            property = await prisma.property.update({
                where: { id: property.id },
                data: {
                    purchasePrice: 1500000,
                    purchaseDate: new Date('2020-01-15'),
                    units: 12,
                    propertyType: 'MULTI_FAMILY'
                }
            });
            console.log(`✅ Updated property: ${property.name}`);
        }

        // Create or get financials
        let financials = await prisma.propertyFinancials.findUnique({
            where: { propertyId: property.id }
        });

        if (!financials) {
            financials = await prisma.propertyFinancials.create({
                data: {
                    propertyId: property.id,
                    currentReserves: 45000,
                    recommendedReserves: 50000,
                    vacancyRate: 5.0,
                }
            });
            console.log(`✅ Created financials for property`);
        }

        // Clear existing income/expenses/debt
        await prisma.propertyIncome.deleteMany({
            where: { propertyFinancialsId: financials.id }
        });
        await prisma.propertyExpense.deleteMany({
            where: { propertyFinancialsId: financials.id }
        });
        await prisma.propertyDebt.deleteMany({
            where: { propertyFinancialsId: financials.id }
        });

        // Create income sources
        const incomes = [
            {
                source: 'rent',
                amount: 15000, // $15k/month from 12 units = $1,250/unit
                frequency: 'monthly',
                description: '12 units @ $1,250/month average'
            },
            {
                source: 'laundry',
                amount: 600,
                frequency: 'monthly',
                description: 'Coin laundry revenue'
            },
            {
                source: 'parking',
                amount: 400,
                frequency: 'monthly',
                description: 'Parking fees'
            }
        ];

        for (const income of incomes) {
            await prisma.propertyIncome.create({
                data: {
                    ...income,
                    propertyFinancialsId: financials.id
                }
            });
        }
        console.log(`✅ Created ${incomes.length} income sources`);
        console.log(`   Total Monthly Income: $${incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`);

        // Create expenses
        const expenses = [
            {
                category: 'property_tax',
                amount: 2500,
                frequency: 'monthly',
                description: 'Annual property tax / 12'
            },
            {
                category: 'insurance',
                amount: 800,
                frequency: 'monthly',
                description: 'Property insurance'
            },
            {
                category: 'water',
                amount: 450,
                frequency: 'monthly',
                description: 'Water/sewer utilities'
            },
            {
                category: 'electric',
                amount: 350,
                frequency: 'monthly',
                description: 'Common area electricity'
            },
            {
                category: 'maintenance',
                amount: 1200,
                frequency: 'monthly',
                description: 'Repairs and maintenance'
            },
            {
                category: 'management_fees',
                amount: 800,
                frequency: 'monthly',
                description: '5% of gross rent'
            },
            {
                category: 'capital_reserve',
                amount: 500,
                frequency: 'monthly',
                description: 'CapEx reserve fund'
            }
        ];

        for (const expense of expenses) {
            await prisma.propertyExpense.create({
                data: {
                    ...expense,
                    propertyFinancialsId: financials.id,
                    isPaid: true
                }
            });
        }
        console.log(`✅ Created ${expenses.length} expense categories`);
        console.log(`   Total Monthly Expenses: $${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`);

        // Create debt (mortgage)
        const debt = await prisma.propertyDebt.create({
            data: {
                propertyFinancialsId: financials.id,
                loanName: 'Primary Mortgage',
                principalBalance: 1200000, // $1.2M remaining (started at ~$1.35M)
                interestRate: 4.5,
                termLengthMonths: 360, // 30-year
                monthlyPayment: 6839, // P&I payment
                originationDate: new Date('2020-01-15'),
                maturityDate: new Date('2050-01-15'),
                lender: 'First National Bank',
                loanType: 'conventional'
            }
        });
        console.log(`✅ Created mortgage debt`);
        console.log(`   Monthly Payment: $${debt.monthlyPayment.toLocaleString()}`);

        // Calculate expected values
        const totalMonthlyIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const monthlyNOI = totalMonthlyIncome - totalMonthlyExpenses;
        const annualNOI = monthlyNOI * 12;
        const monthlyCashFlow = monthlyNOI - debt.monthlyPayment;
        const annualCashFlow = monthlyCashFlow * 12;

        console.log('\n📊 Financial Summary:');
        console.log(`   Monthly Income: $${totalMonthlyIncome.toLocaleString()}`);
        console.log(`   Monthly Expenses: $${totalMonthlyExpenses.toLocaleString()}`);
        console.log(`   Monthly NOI: $${monthlyNOI.toLocaleString()}`);
        console.log(`   Annual NOI: $${annualNOI.toLocaleString()}`);
        console.log(`   Monthly Cash Flow (after debt): $${monthlyCashFlow.toLocaleString()}`);
        console.log(`   Annual Cash Flow: $${annualCashFlow.toLocaleString()}`);

        // Calculate implied cap rate from purchase
        const impliedCapRate = (annualNOI / property.purchasePrice!) * 100;
        console.log(`\n💡 Implied Cap Rate at Purchase: ${impliedCapRate.toFixed(2)}%`);

        // Estimate current value at 7% cap rate (market rate for multi-family)
        const marketCapRate = 7.0;
        const estimatedValue = annualNOI / (marketCapRate / 100);
        const appreciation = estimatedValue - property.purchasePrice!;
        const appreciationPercent = (appreciation / property.purchasePrice!) * 100;
        const yearsOwned = (Date.now() - property.purchaseDate!.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const annualAppreciationRate = (Math.pow(estimatedValue / property.purchasePrice!, 1 / yearsOwned) - 1) * 100;

        console.log(`\n📈 Expected Valuation Results (at ${marketCapRate}% cap rate):`);
        console.log(`   Purchase Price: $${property.purchasePrice!.toLocaleString()}`);
        console.log(`   Estimated Value: $${Math.round(estimatedValue).toLocaleString()}`);
        console.log(`   Total Appreciation: $${Math.round(appreciation).toLocaleString()} (${appreciationPercent.toFixed(1)}%)`);
        console.log(`   Annual Appreciation Rate: ${annualAppreciationRate.toFixed(2)}%`);
        console.log(`   Years Owned: ${yearsOwned.toFixed(1)}`);

        // Calculate Cash-on-Cash return
        const downPayment = property.purchasePrice! * 0.2; // Assume 20% down
        const closingCosts = property.purchasePrice! * 0.03; // 3% closing
        const totalCashInvested = downPayment + closingCosts;
        const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;

        console.log(`\n💰 Investment Returns:`);
        console.log(`   Total Cash Invested: $${totalCashInvested.toLocaleString()}`);
        console.log(`   Annual Cash Flow: $${annualCashFlow.toLocaleString()}`);
        console.log(`   Cash-on-Cash Return: ${cashOnCashReturn.toFixed(2)}%`);

        console.log(`\n✅ Seed complete! Property ID: ${property.id}`);
        console.log(`\n🧪 Test the valuation system:`);
        console.log(`   1. Navigate to: http://localhost:3000/properties/${property.id}/financials`);
        console.log(`   2. Click "Calculate Now" on the valuation card`);
        console.log(`   3. Click "Generate Projections" for 5-year forecast`);
        console.log(`\n   Expected valuation: ~$${Math.round(estimatedValue / 1000)}k`);
        console.log(`   Expected appreciation: ~${appreciationPercent.toFixed(0)}%`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedValuationTest();
