/**
 * Net Income Calculator
 * Calculates property net income: (Total Income - Vacancy Loss) - Total Expenses
 */

export interface IncomeItem {
    amount: number;
    frequency: string;
    isRecurring: boolean;
}

export interface ExpenseItem {
    amount: number;
    frequency: string;
}

export interface NetIncomeCalculation {
    grossIncome: number;
    vacancyLoss: number;
    effectiveGrossIncome: number;
    totalExpenses: number;
    netOperatingIncome: number;
    monthlyNetIncome: number;
    annualNetIncome: number;
    breakdown: {
        incomeBySource: Record<string, number>;
        expensesByCategory: Record<string, number>;
    };
}

/**
 * Normalize amount to monthly value
 */
function normalizeToMonthly(amount: number, frequency: string): number {
    switch (frequency.toLowerCase()) {
        case 'monthly':
            return amount;
        case 'annual':
        case 'yearly':
            return amount / 12;
        case 'quarterly':
            return amount / 3;
        case 'weekly':
            return amount * 4.33; // Average weeks per month
        case 'one_time':
        case 'onetime':
            return 0; // Don't include one-time in recurring calculations
        default:
            return amount;
    }
}

/**
 * Calculate net income for a property
 */
export function calculateNetIncome(
    income: Array<IncomeItem & { source: string }>,
    expenses: Array<ExpenseItem & { category: string }>,
    vacancyRate: number = 0 // Percentage (e.g., 5 for 5%)
): NetIncomeCalculation {
    // Calculate gross monthly income (recurring only)
    const incomeBySource: Record<string, number> = {};
    let monthlyGrossIncome = 0;

    income.forEach(item => {
        if (item.isRecurring) {
            const monthlyAmount = normalizeToMonthly(item.amount, item.frequency);
            monthlyGrossIncome += monthlyAmount;
            incomeBySource[item.source] = (incomeBySource[item.source] || 0) + monthlyAmount;
        }
    });

    // Calculate vacancy loss
    const monthlyVacancyLoss = monthlyGrossIncome * (vacancyRate / 100);

    // Effective gross income
    const effectiveGrossIncome = monthlyGrossIncome - monthlyVacancyLoss;

    // Calculate total monthly expenses
    const expensesByCategory: Record<string, number> = {};
    let monthlyExpenses = 0;

    expenses.forEach(item => {
        const monthlyAmount = normalizeToMonthly(item.amount, item.frequency);
        monthlyExpenses += monthlyAmount;
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + monthlyAmount;
    });

    // Net Operating Income (NOI)
    const monthlyNOI = effectiveGrossIncome - monthlyExpenses;

    return {
        grossIncome: monthlyGrossIncome,
        vacancyLoss: monthlyVacancyLoss,
        effectiveGrossIncome,
        totalExpenses: monthlyExpenses,
        netOperatingIncome: monthlyNOI,
        monthlyNetIncome: monthlyNOI,
        annualNetIncome: monthlyNOI * 12,
        breakdown: {
            incomeBySource,
            expensesByCategory
        }
    };
}

/**
 * Calculate cap rate (Capitalization Rate)
 * Cap Rate = (Annual NOI / Property Value) * 100
 */
export function calculateCapRate(annualNOI: number, propertyValue: number): number {
    if (propertyValue === 0) return 0;
    return (annualNOI / propertyValue) * 100;
}

/**
 * Calculate cash-on-cash return
 * CoC = (Annual Pre-Tax Cash Flow / Total Cash Invested) * 100
 */
export function calculateCashOnCash(annualCashFlow: number, totalInvestment: number): number {
    if (totalInvestment === 0) return 0;
    return (annualCashFlow / totalInvestment) * 100;
}
