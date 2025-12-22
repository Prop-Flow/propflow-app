const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFinancialData() {
    console.log('Starting financial data seed...');

    // Get first property
    const property = await prisma.property.findFirst();

    if (!property) {
        console.log('No properties found. Please create a property first.');
        return;
    }

    console.log(`Found property: ${property.name} (${property.id})`);

    // Create or get financials
    let financials = await prisma.propertyFinancials.findUnique({
        where: { propertyId: property.id }
    });

    if (!financials) {
        financials = await prisma.propertyFinancials.create({
            data: {
                propertyId: property.id,
                currentReserves: 25000,
                vacancyRate: 5.0,
                estimatedVacancyLoss: 0
            }
        });
        console.log('Created PropertyFinancials');
    }

    // Add income sources
    const incomeData = [
        { source: 'rent', amount: 12000, frequency: 'monthly', description: 'Monthly rent from all units' },
        { source: 'laundry', amount: 300, frequency: 'monthly', description: 'Coin laundry revenue' },
        { source: 'parking', amount: 500, frequency: 'monthly', description: 'Parking space rentals' },
    ];

    for (const income of incomeData) {
        await prisma.propertyIncome.create({
            data: {
                propertyFinancialsId: financials.id,
                ...income,
                isRecurring: true
            }
        });
    }
    console.log(`Added ${incomeData.length} income sources`);

    // Add expenses
    const expenseData = [
        { category: 'property_tax', amount: 18000, frequency: 'annual', description: 'Annual property tax' },
        { category: 'insurance', amount: 12000, frequency: 'annual', description: 'Building insurance' },
        { category: 'water', amount: 800, frequency: 'monthly', description: 'Water utility' },
        { category: 'electric', amount: 1200, frequency: 'monthly', description: 'Electric utility' },
        { category: 'gas', amount: 400, frequency: 'monthly', description: 'Gas utility' },
        { category: 'maintenance', amount: 1500, frequency: 'monthly', description: 'General maintenance and repairs' },
        { category: 'landscaping', amount: 500, frequency: 'monthly', description: 'Grounds keeping' },
        { category: 'management_fees', amount: 1200, frequency: 'monthly', description: 'Property management fees (10%)' },
    ];

    for (const expense of expenseData) {
        await prisma.propertyExpense.create({
            data: {
                propertyFinancialsId: financials.id,
                ...expense,
                isPaid: false
            }
        });
    }
    console.log(`Added ${expenseData.length} expenses`);

    // Add a debt/loan
    const debt = await prisma.propertyDebt.create({
        data: {
            propertyFinancialsId: financials.id,
            loanName: 'Primary Mortgage',
            principalBalance: 450000,
            interestRate: 6.5,
            termLengthMonths: 360,
            monthlyPayment: 2843,
            originationDate: new Date('2020-01-15'),
            maturityDate: new Date('2050-01-15'),
            nextPaymentDue: new Date('2025-02-01'),
            lender: 'First National Bank',
            loanType: 'conventional',
            shouldMonitorRefinancing: true
        }
    });
    console.log('Added mortgage debt');

    // Create a refinancing alert (since current rates might be lower)
    await prisma.refinancingAlert.create({
        data: {
            propertyDebtId: debt.id,
            currentRate: 6.5,
            marketRate: 5.8,
            potentialSavings: 250,
            breakEvenMonths: 18,
            isActive: true,
            isDismissed: false
        }
    });
    console.log('Created refinancing alert');

    console.log('\n✅ Financial data seeded successfully!');
    console.log(`\nNavigate to: http://localhost:3000/properties/${property.id}/financials`);
}

seedFinancialData()
    .catch(e => console.error('Error seeding data:', e))
    .finally(async () => {
        await prisma.$disconnect();
    });
