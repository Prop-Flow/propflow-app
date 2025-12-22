/**
 * Property Valuation Calculator
 * Calculates property value from NOI and cap rates, tracks appreciation,
 * and projects future values - all using internal financial data
 */

export interface ValuationResult {
    estimatedValue: number;
    totalAppreciation: number;
    appreciationRate: number; // Annual %
    totalReturn: number; // Total % return
    impliedCapRate?: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProjectionYear {
    year: number;
    value: number;
    noi: number;
    cashFlow: number;
    equity: number;
}

/**
 * Calculate property value using Income Approach
 * Formula: Property Value = Annual NOI / Cap Rate
 */
export function calculatePropertyValue(
    annualNOI: number,
    capRate: number
): number {
    if (capRate <= 0) {
        throw new Error('Cap rate must be greater than 0');
    }
    return annualNOI / (capRate / 100);
}

/**
 * Calculate implied cap rate from purchase
 * Formula: Cap Rate = (NOI / Purchase Price) × 100
 */
export function calculateImpliedCapRate(
    annualNOI: number,
    purchasePrice: number
): number {
    if (purchasePrice <= 0) {
        return 0;
    }
    return (annualNOI / purchasePrice) * 100;
}

/**
 * Calculate appreciation metrics
 */
export function calculateAppreciation(
    currentValue: number,
    purchasePrice: number,
    purchaseDate: Date
): {
    totalAppreciation: number;
    annualRate: number;
    totalReturn: number;
    yearsOwned: number;
} {
    const years = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const totalAppreciation = currentValue - purchasePrice;

    // Calculate annualized rate using CAGR formula
    const annualRate = years > 0
        ? (Math.pow(currentValue / purchasePrice, 1 / years) - 1) * 100
        : 0;

    const totalReturn = (totalAppreciation / purchasePrice) * 100;

    return {
        totalAppreciation,
        annualRate,
        totalReturn,
        yearsOwned: years
    };
}

/**
 * Calculate complete valuation with all metrics
 */
export function calculateValuation(
    annualNOI: number,
    capRate: number,
    purchasePrice?: number,
    purchaseDate?: Date
): ValuationResult {
    // Calculate current value
    const estimatedValue = calculatePropertyValue(annualNOI, capRate);

    // Calculate appreciation if purchase data available
    let totalAppreciation = 0;
    let appreciationRate = 0;
    let totalReturn = 0;
    let impliedCapRate: number | undefined;

    if (purchasePrice && purchaseDate) {
        const appreciation = calculateAppreciation(estimatedValue, purchasePrice, purchaseDate);
        totalAppreciation = appreciation.totalAppreciation;
        appreciationRate = appreciation.annualRate;
        totalReturn = appreciation.totalReturn;

        // Calculate implied cap rate at purchase
        impliedCapRate = calculateImpliedCapRate(annualNOI, purchasePrice);
    }

    // Determine confidence based on data availability
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (purchasePrice && purchaseDate && impliedCapRate) {
        // High confidence if we have purchase data and implied cap rate is close to market rate
        const capRateDiff = Math.abs(capRate - impliedCapRate);
        confidence = capRateDiff < 1 ? 'HIGH' : 'MEDIUM';
    } else if (!purchasePrice) {
        confidence = 'LOW';
    }

    return {
        estimatedValue,
        totalAppreciation,
        appreciationRate,
        totalReturn,
        impliedCapRate,
        confidence
    };
}

/**
 * Project future property value
 */
export function projectFutureValue(
    currentValue: number,
    years: number,
    annualAppreciationRate: number
): number {
    return currentValue * Math.pow(1 + (annualAppreciationRate / 100), years);
}

/**
 * Project future NOI with different growth rates for income and expenses
 */
export function projectFutureNOI(
    currentIncome: number,
    currentExpenses: number,
    years: number,
    incomeGrowthRate: number,
    expenseGrowthRate: number
): number[] {
    const projections: number[] = [];

    for (let year = 1; year <= years; year++) {
        const futureIncome = currentIncome * Math.pow(1 + (incomeGrowthRate / 100), year);
        const futureExpenses = currentExpenses * Math.pow(1 + (expenseGrowthRate / 100), year);
        const noi = futureIncome - futureExpenses;
        projections.push(noi);
    }

    return projections;
}

/**
 * Calculate complete 5-year projections
 */
export function calculateProjections(
    currentValue: number,
    currentNOI: number,
    currentIncome: number,
    currentExpenses: number,
    currentDebtService: number,
    capRate: number,
    assumptions: {
        appreciationRate: number;
        incomeGrowthRate: number;
        expenseGrowthRate: number;
        projectionYears?: number;
    }
): ProjectionYear[] {
    const years = assumptions.projectionYears || 5;
    const projections: ProjectionYear[] = [];

    // Project NOI for each year
    const noiProjections = projectFutureNOI(
        currentIncome,
        currentExpenses,
        years,
        assumptions.incomeGrowthRate,
        assumptions.expenseGrowthRate
    );

    let cumulativeEquity = 0;

    for (let year = 1; year <= years; year++) {
        // Project value using appreciation rate
        const value = projectFutureValue(currentValue, year, assumptions.appreciationRate);

        // Use projected NOI
        const noi = noiProjections[year - 1];

        // Cash flow = NOI - Debt Service
        const cashFlow = noi - currentDebtService;

        // Equity = Appreciation + Cash Flow
        cumulativeEquity += cashFlow;
        const equity = (value - currentValue) + cumulativeEquity;

        projections.push({
            year,
            value: Math.round(value),
            noi: Math.round(noi),
            cashFlow: Math.round(cashFlow),
            equity: Math.round(equity)
        });
    }

    return projections;
}

/**
 * Calculate sale scenario
 */
export function calculateSaleScenario(
    projectedValue: number,
    remainingLoanBalance: number,
    sellingCosts: number = 0.06 // 6% default (agent fees, closing costs)
): {
    salePrice: number;
    sellingCosts: number;
    netProceeds: number;
    equity: number;
} {
    const salePrice = projectedValue;
    const costs = salePrice * sellingCosts;
    const netProceeds = salePrice - costs - remainingLoanBalance;
    const equity = netProceeds;

    return {
        salePrice,
        sellingCosts: costs,
        netProceeds,
        equity
    };
}

/**
 * Determine appropriate cap rate based on property type
 */
export function getDefaultCapRate(propertyType?: string): number {
    const type = (propertyType || '').toLowerCase();

    // Default cap rates by property type
    if (type.includes('single') || type.includes('sfr')) {
        return 6.0; // Single family: 5-7%
    } else if (type.includes('multi') && type.includes('2')) {
        return 7.0; // 2-4 unit: 6-8%
    } else if (type.includes('multi')) {
        return 8.0; // 5+ unit: 7-9%
    } else if (type.includes('commercial')) {
        return 10.0; // Commercial: 8-12%
    }

    return 7.0; // Default
}

/**
 * Calculate confidence score for valuation
 */
export function calculateConfidenceScore(
    hasPurchaseData: boolean,
    capRateSource: 'USER_INPUT' | 'IMPLIED' | 'DEFAULT',
    noiStability: number // 0-1, based on historical variance
): number {
    let score = 0.5; // Base score

    if (hasPurchaseData) score += 0.2;

    if (capRateSource === 'IMPLIED') score += 0.2;
    else if (capRateSource === 'USER_INPUT') score += 0.15;

    score += noiStability * 0.15;

    return Math.min(1, Math.max(0, score));
}
