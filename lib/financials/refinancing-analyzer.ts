/**
 * Refinancing Analyzer
 * Monitors interest rates and calculates potential savings from refinancing
 * Enhanced with statistical reasoning and comprehensive financial analysis
 */

export interface RefinancingOpportunity {
    shouldRefinance: boolean;
    currentRate: number;
    marketRate: number;
    rateDifference: number;
    monthlySavings: number;
    annualSavings: number;
    estimatedClosingCosts: number;
    breakEvenMonths: number;
    lifetimeSavings: number;
    netPresentValue: number; // NPV of refinancing decision
    recommendation: string;
    reasoning: string[];
    riskFactors: string[];
    additionalMetrics: {
        totalInterestCurrentLoan: number;
        totalInterestNewLoan: number;
        totalInterestSavings: number;
        effectiveRate: number; // Accounting for closing costs
        remainingTermMonths: number;
    };
}

export interface LoanDetails {
    principalBalance: number;
    interestRate: number; // Annual percentage
    termLengthMonths: number;
    monthlyPayment: number;
    remainingMonths?: number;
    originationDate?: Date;
    propertyValue?: number; // For LTV calculation
    prepaymentPenalty?: number; // If applicable
}

/**
 * Calculate monthly payment for a loan using standard amortization formula
 */
export function calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termMonths: number
): number {
    if (annualRate === 0) return principal / termMonths;

    const monthlyRate = annualRate / 100 / 12;
    const payment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);

    return payment;
}

/**
 * Calculate remaining balance on a loan
 */
export function calculateRemainingBalance(
    originalPrincipal: number,
    annualRate: number,
    termMonths: number,
    monthsPaid: number
): number {
    if (monthsPaid >= termMonths) return 0;

    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = calculateMonthlyPayment(originalPrincipal, annualRate, termMonths);

    const remainingBalance = originalPrincipal *
        Math.pow(1 + monthlyRate, monthsPaid) -
        monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);

    return Math.max(0, remainingBalance);
}

/**
 * Calculate total interest paid over life of loan
 */
function calculateTotalInterest(
    principal: number,
    monthlyPayment: number,
    termMonths: number
): number {
    return (monthlyPayment * termMonths) - principal;
}

/**
 * Estimate closing costs for refinancing
 * Industry standard: 2-6% of loan amount
 * Breakdown: Origination (0.5-1%), Appraisal ($300-500), Title ($1000-2000), etc.
 */
function estimateClosingCosts(loanAmount: number): number {
    // Conservative estimate at 3% of loan amount
    const percentageCost = loanAmount * 0.03;

    // Add fixed costs
    const fixedCosts = 300 + 1500 + 500; // Appraisal + Title + Misc

    return percentageCost + fixedCosts;
}

/**
 * Calculate Net Present Value of refinancing decision
 * Accounts for time value of money
 */
function calculateNPV(
    monthlySavings: number,
    closingCosts: number,
    termMonths: number,
    discountRate: number = 0.05 // 5% annual discount rate
): number {
    const monthlyDiscountRate = discountRate / 12;
    let npv = -closingCosts; // Initial outlay

    for (let month = 1; month <= termMonths; month++) {
        const presentValue = monthlySavings / Math.pow(1 + monthlyDiscountRate, month);
        npv += presentValue;
    }

    return npv;
}

/**
 * Calculate Loan-to-Value ratio
 */
function calculateLTV(loanAmount: number, propertyValue: number): number {
    if (propertyValue === 0) return 0;
    return (loanAmount / propertyValue) * 100;
}

/**
 * Analyze refinancing opportunity with comprehensive statistical reasoning
 */
export function analyzeRefinancing(
    currentLoan: LoanDetails,
    marketRate: number,
    assumedTermMonths?: number,
    propertyValue?: number
): RefinancingOpportunity {
    const reasoning: string[] = [];
    const riskFactors: string[] = [];

    // Calculate remaining term if not provided
    let remainingMonths = currentLoan.remainingMonths;
    if (!remainingMonths && currentLoan.originationDate) {
        const monthsSinceOrigination = Math.floor(
            (Date.now() - currentLoan.originationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        remainingMonths = Math.max(0, currentLoan.termLengthMonths - monthsSinceOrigination);
    } else if (!remainingMonths) {
        remainingMonths = currentLoan.termLengthMonths;
    }

    // Use remaining term or new term for refinancing
    const newTermMonths = assumedTermMonths || remainingMonths;

    // Calculate actual remaining balance
    const actualBalance = currentLoan.principalBalance;

    // Calculate new monthly payment at market rate
    const newMonthlyPayment = calculateMonthlyPayment(
        actualBalance,
        marketRate,
        newTermMonths
    );

    // Calculate savings
    const monthlySavings = currentLoan.monthlyPayment - newMonthlyPayment;
    const annualSavings = monthlySavings * 12;

    // Estimate closing costs
    let closingCosts = estimateClosingCosts(actualBalance);

    // Add prepayment penalty if applicable
    if (currentLoan.prepaymentPenalty) {
        closingCosts += currentLoan.prepaymentPenalty;
        riskFactors.push(`Prepayment penalty of $${currentLoan.prepaymentPenalty.toLocaleString()} applies`);
    }

    // Calculate break-even point
    const breakEvenMonths = monthlySavings > 0
        ? Math.ceil(closingCosts / monthlySavings)
        : Infinity;

    // Calculate total interest comparisons
    const totalInterestCurrent = calculateTotalInterest(
        actualBalance,
        currentLoan.monthlyPayment,
        remainingMonths
    );

    const totalInterestNew = calculateTotalInterest(
        actualBalance,
        newMonthlyPayment,
        newTermMonths
    );

    const totalInterestSavings = totalInterestCurrent - totalInterestNew;

    // Calculate lifetime savings (accounting for closing costs)
    const lifetimeSavings = totalInterestSavings - closingCosts;

    // Calculate NPV of refinancing decision
    const npv = calculateNPV(monthlySavings, closingCosts, newTermMonths);

    // Calculate effective rate (including closing costs amortized)
    const effectiveClosingCostPerMonth = closingCosts / newTermMonths;
    // const effectiveMonthlyPayment = newMonthlyPayment + effectiveClosingCostPerMonth;
    const effectiveRate = marketRate + (effectiveClosingCostPerMonth / actualBalance) * 1200;

    // LTV Analysis
    let ltvRatio = 0;
    if (propertyValue || currentLoan.propertyValue) {
        ltvRatio = calculateLTV(actualBalance, propertyValue || currentLoan.propertyValue || 0);

        if (ltvRatio > 80) {
            riskFactors.push(`High LTV ratio (${ltvRatio.toFixed(1)}%) may require PMI or affect rate`);
        }

        reasoning.push(`Loan-to-Value ratio: ${ltvRatio.toFixed(1)}%`);
    }

    // Determine if refinancing makes sense
    const rateDifference = currentLoan.interestRate - marketRate;
    let shouldRefinance = false;
    let recommendation = '';

    // Decision logic with statistical reasoning
    if (rateDifference >= 1.5 && npv > 0) {
        // Excellent opportunity
        shouldRefinance = true;
        recommendation = 'Strong refinancing opportunity - Highly recommended';
        reasoning.push(`Significant rate reduction of ${rateDifference.toFixed(2)}% (${((rateDifference / currentLoan.interestRate) * 100).toFixed(1)}% relative decrease)`);
        reasoning.push(`Monthly savings: $${monthlySavings.toFixed(2)} (${((monthlySavings / currentLoan.monthlyPayment) * 100).toFixed(1)}% payment reduction)`);
        reasoning.push(`Break-even in ${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} years)`);
        reasoning.push(`Positive NPV of $${npv.toFixed(2)} indicates strong financial benefit`);
        reasoning.push(`Lifetime interest savings: $${totalInterestSavings.toLocaleString()}`);
    } else if (rateDifference >= 0.75 && breakEvenMonths <= 36 && npv > 0) {
        // Good opportunity
        shouldRefinance = true;
        recommendation = 'Refinancing recommended';
        reasoning.push(`Moderate rate reduction of ${rateDifference.toFixed(2)}%`);
        reasoning.push(`Quick break-even period of ${breakEvenMonths} months`);
        reasoning.push(`Annual savings of $${annualSavings.toFixed(2)}`);
        reasoning.push(`Net present value: $${npv.toFixed(2)}`);

        if (remainingMonths > breakEvenMonths * 2) {
            reasoning.push(`Sufficient remaining term (${remainingMonths} months) to realize benefits`);
        } else {
            riskFactors.push(`Limited remaining term may reduce total benefit`);
        }
    } else if (rateDifference >= 0.5 && breakEvenMonths <= 24 && npv > 5000) {
        // Marginal opportunity
        shouldRefinance = true;
        recommendation = 'Consider refinancing - Marginal benefit';
        reasoning.push(`Rate reduction of ${rateDifference.toFixed(2)}%`);
        reasoning.push(`Break-even in ${breakEvenMonths} months`);
        reasoning.push(`Positive NPV of $${npv.toFixed(2)}`);

        riskFactors.push('Benefit is marginal - consider transaction costs and effort');
    } else if (rateDifference <= 0) {
        // No benefit
        shouldRefinance = false;
        recommendation = 'Do not refinance';
        reasoning.push('Current rate is equal to or better than market rate');
        reasoning.push('No financial benefit to refinancing');
    } else if (npv <= 0) {
        // Negative NPV
        shouldRefinance = false;
        recommendation = 'Do not refinance - Negative net present value';
        reasoning.push(`Rate difference of ${rateDifference.toFixed(2)}% exists but NPV is negative ($${npv.toFixed(2)})`);
        reasoning.push(`Closing costs ($${closingCosts.toFixed(2)}) outweigh benefits over loan term`);
    } else {
        // Insufficient benefit
        shouldRefinance = false;
        recommendation = 'Monitor rates - Insufficient benefit currently';
        reasoning.push(`Rate difference of ${rateDifference.toFixed(2)}% is modest`);
        reasoning.push(`Break-even period of ${breakEvenMonths} months is too long relative to benefits`);
        reasoning.push('Wait for more favorable market conditions');

        if (rateDifference >= 0.25) {
            reasoning.push(`Consider refinancing if rates drop another ${(0.5 - rateDifference).toFixed(2)}%`);
        }
    }

    // Additional risk factors
    if (breakEvenMonths > remainingMonths / 2) {
        riskFactors.push('Break-even point exceeds half of remaining loan term');
    }

    if (newTermMonths > remainingMonths) {
        const additionalInterest = totalInterestNew - totalInterestCurrent;
        if (additionalInterest > 0) {
            riskFactors.push(`Extending term will increase total interest by $${additionalInterest.toLocaleString()} despite lower rate`);
        }
    }

    return {
        shouldRefinance,
        currentRate: currentLoan.interestRate,
        marketRate,
        rateDifference,
        monthlySavings,
        annualSavings,
        estimatedClosingCosts: closingCosts,
        breakEvenMonths,
        lifetimeSavings,
        netPresentValue: npv,
        recommendation,
        reasoning,
        riskFactors,
        additionalMetrics: {
            totalInterestCurrentLoan: totalInterestCurrent,
            totalInterestNewLoan: totalInterestNew,
            totalInterestSavings,
            effectiveRate,
            remainingTermMonths: remainingMonths
        }
    };
}

/**
 * Get current market interest rates (mock - in production, integrate with rate API)
 * Sources: Freddie Mac Primary Mortgage Market Survey, Fannie Mae, etc.
 */
export async function getCurrentMarketRates(): Promise<{
    conventional30Year: number;
    conventional15Year: number;
    conventional20Year: number;
    fha30Year: number;
    va30Year: number;
    commercial: number;
    jumbo30Year: number;
    lastUpdated: Date;
}> {
    // Mock data - in production, fetch from Freddie Mac, Fannie Mae, or rate aggregator API
    // Example APIs: Zillow Mortgage API, Bankrate API, Mortgage News Daily
    return {
        conventional30Year: 6.5,
        conventional15Year: 5.8,
        conventional20Year: 6.2,
        fha30Year: 6.2,
        va30Year: 6.0,
        commercial: 7.2,
        jumbo30Year: 6.8,
        lastUpdated: new Date()
    };
}

/**
 * Determine appropriate market rate based on loan type and characteristics
 */
export function getApplicableMarketRate(
    loanType: string | null | undefined,
    loanAmount: number,
    marketRates: Awaited<ReturnType<typeof getCurrentMarketRates>>
): number {
    const type = (loanType || '').toLowerCase();

    // Jumbo loan threshold (2024)
    const jumboThreshold = 766550;

    if (loanAmount > jumboThreshold) {
        return marketRates.jumbo30Year;
    }

    if (type.includes('fha')) return marketRates.fha30Year;
    if (type.includes('va')) return marketRates.va30Year;
    if (type.includes('commercial')) return marketRates.commercial;
    if (type.includes('15')) return marketRates.conventional15Year;
    if (type.includes('20')) return marketRates.conventional20Year;

    return marketRates.conventional30Year; // Default
}
