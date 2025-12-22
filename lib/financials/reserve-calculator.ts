/**
 * Operating Reserve Calculator
 * Calculates recommended operating reserves for a property based on:
 * - Base: 3-6 months of operating expenses
 * - Property age adjustments
 * - Unit count adjustments
 * - Minimum reserve floor
 */

export interface ReserveCalculation {
    recommendedAmount: number;
    reasoning: {
        baseMonthsExpenses: number;
        monthlyExpenses: number;
        baseReserve: number;
        ageAdjustment: {
            percentage: number;
            amount: number;
            reason: string;
        };
        unitCountAdjustment: {
            percentage: number;
            amount: number;
            reason: string;
        };
        minimumReserve: number;
        finalAmount: number;
        summary: string;
    };
}

export interface PropertyData {
    monthlyExpenses: number;
    yearBuilt?: number;
    units: number;
    propertyType?: string;
}

export function calculateOperatingReserves(property: PropertyData): ReserveCalculation {
    const currentYear = new Date().getFullYear();
    const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : 0;

    // Base calculation: 3-6 months of expenses
    // Use 4 months as baseline, adjust based on property characteristics
    let baseMonths = 4;

    // Adjust base months for property type
    if (property.propertyType === 'commercial') {
        baseMonths = 6; // Commercial properties need more reserves
    }

    const baseReserve = property.monthlyExpenses * baseMonths;

    // Age-based adjustment
    let ageAdjustmentPercentage = 0;
    let ageReason = 'Property is relatively new';

    if (propertyAge > 30) {
        ageAdjustmentPercentage = 50;
        ageReason = 'Property is over 30 years old - higher risk of major repairs (roof, HVAC, plumbing)';
    } else if (propertyAge > 20) {
        ageAdjustmentPercentage = 25;
        ageReason = 'Property is over 20 years old - increased maintenance needs';
    } else if (propertyAge > 10) {
        ageAdjustmentPercentage = 10;
        ageReason = 'Property is over 10 years old - moderate maintenance expected';
    }

    const ageAdjustment = baseReserve * (ageAdjustmentPercentage / 100);

    // Unit count adjustment
    let unitAdjustmentPercentage = 0;
    let unitReason = 'Single or small multi-unit property';

    if (property.units >= 50) {
        unitAdjustmentPercentage = 30;
        unitReason = 'Large property (50+ units) - economies of scale but higher total risk exposure';
    } else if (property.units >= 20) {
        unitAdjustmentPercentage = 20;
        unitReason = 'Medium property (20+ units) - diversified risk across multiple units';
    } else if (property.units >= 10) {
        unitAdjustmentPercentage = 10;
        unitReason = 'Multi-unit property (10+ units) - some risk diversification';
    }

    const unitAdjustment = baseReserve * (unitAdjustmentPercentage / 100);

    // Calculate total
    const calculatedReserve = baseReserve + ageAdjustment + unitAdjustment;

    // Apply minimum floor
    const minimumReserve = 5000;
    const finalAmount = Math.max(calculatedReserve, minimumReserve);

    // Generate summary
    const summary = `Based on ${baseMonths} months of operating expenses ($${property.monthlyExpenses.toLocaleString()}/month), ` +
        `with adjustments for property age (${propertyAge} years, +${ageAdjustmentPercentage}%) ` +
        `and unit count (${property.units} units, +${unitAdjustmentPercentage}%), ` +
        `we recommend maintaining $${finalAmount.toLocaleString()} in operating reserves. ` +
        `This provides a financial cushion for unexpected repairs, vacancy periods, and capital improvements.`;

    return {
        recommendedAmount: finalAmount,
        reasoning: {
            baseMonthsExpenses: baseMonths,
            monthlyExpenses: property.monthlyExpenses,
            baseReserve,
            ageAdjustment: {
                percentage: ageAdjustmentPercentage,
                amount: ageAdjustment,
                reason: ageReason
            },
            unitCountAdjustment: {
                percentage: unitAdjustmentPercentage,
                amount: unitAdjustment,
                reason: unitReason
            },
            minimumReserve,
            finalAmount,
            summary
        }
    };
}

/**
 * Calculate monthly equivalent for different frequencies
 */
export function normalizeToMonthly(amount: number, frequency: string): number {
    switch (frequency.toLowerCase()) {
        case 'monthly':
            return amount;
        case 'annual':
        case 'yearly':
            return amount / 12;
        case 'quarterly':
            return amount / 3;
        case 'one_time':
        case 'onetime':
            return 0; // Don't include one-time in monthly calculations
        default:
            return amount; // Assume monthly if unknown
    }
}
