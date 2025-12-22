/**
 * Property Depreciation Calculator
 * IRS-compliant MACRS depreciation for residential rental property
 * 
 * Key Rules:
 * - 27.5 year recovery period for residential rental
 * - Straight-line depreciation method
 * - Mid-month convention (property placed in service mid-month)
 * - Only building value is depreciable (land excluded)
 */

export interface DepreciationInputs {
    purchasePrice: number;
    purchaseDate: Date;
    assessedLandValue: number;
    assessedBuildingValue: number;
}

export interface DepreciationResult {
    purchasePrice: number;
    landValue: number;
    buildingValue: number;
    depreciableValue: number;
    annualDepreciation: number;
    firstYearDepreciation: number;
    monthsInFirstYear: number;
    recoveryPeriod: number;
}

export interface DepreciationScheduleEntry {
    year: number;
    taxYear: number;
    depreciation: number;
    accumulatedDepreciation: number;
    remainingValue: number;
}

const RECOVERY_PERIOD_YEARS = 27.5;
const MONTHS_PER_YEAR = 12;

/**
 * Calculate land/building allocation ratio from tax assessment
 */
function calculateAllocationRatio(assessedLand: number, assessedBuilding: number): {
    landRatio: number;
    buildingRatio: number;
} {
    const total = assessedLand + assessedBuilding;

    if (total === 0) {
        throw new Error('Total assessed value cannot be zero');
    }

    return {
        landRatio: assessedLand / total,
        buildingRatio: assessedBuilding / total,
    };
}

/**
 * Calculate months in first year using mid-month convention
 * Property is considered placed in service on the 15th of the month
 */
function calculateFirstYearMonths(purchaseDate: Date): number {
    const purchaseMonth = purchaseDate.getMonth(); // 0-11
    // const purchaseYear = purchaseDate.getFullYear();

    // Mid-month convention: count from purchase month to end of year
    // Plus 0.5 for the purchase month itself
    const monthsRemaining = 12 - purchaseMonth - 0.5;

    return monthsRemaining;
}

/**
 * Calculate property depreciation using MACRS
 */
export function calculateDepreciation(inputs: DepreciationInputs): DepreciationResult {
    const { purchasePrice, purchaseDate, assessedLandValue, assessedBuildingValue } = inputs;

    // Validate inputs
    if (purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than zero');
    }
    if (assessedBuildingValue <= 0) {
        throw new Error('Assessed building value must be greater than zero');
    }
    if (purchaseDate > new Date()) {
        throw new Error('Purchase date cannot be in the future');
    }

    // Calculate allocation ratio from tax assessment
    const { landRatio, buildingRatio } = calculateAllocationRatio(
        assessedLandValue,
        assessedBuildingValue
    );

    // Apply ratio to purchase price
    const landValue = purchasePrice * landRatio;
    const buildingValue = purchasePrice * buildingRatio;

    // Only building is depreciable
    const depreciableValue = buildingValue;

    // Annual depreciation (straight-line over 27.5 years)
    const annualDepreciation = depreciableValue / RECOVERY_PERIOD_YEARS;

    // First year depreciation (mid-month convention)
    const monthsInFirstYear = calculateFirstYearMonths(purchaseDate);
    const firstYearDepreciation = (annualDepreciation / MONTHS_PER_YEAR) * monthsInFirstYear;

    return {
        purchasePrice,
        landValue: Math.round(landValue * 100) / 100,
        buildingValue: Math.round(buildingValue * 100) / 100,
        depreciableValue: Math.round(depreciableValue * 100) / 100,
        annualDepreciation: Math.round(annualDepreciation * 100) / 100,
        firstYearDepreciation: Math.round(firstYearDepreciation * 100) / 100,
        monthsInFirstYear: Math.round(monthsInFirstYear * 10) / 10,
        recoveryPeriod: RECOVERY_PERIOD_YEARS,
    };
}

/**
 * Generate complete depreciation schedule
 */
export function generateDepreciationSchedule(
    inputs: DepreciationInputs
): DepreciationScheduleEntry[] {
    const result = calculateDepreciation(inputs);
    const schedule: DepreciationScheduleEntry[] = [];

    const startYear = inputs.purchaseDate.getFullYear();
    const totalYears = Math.ceil(RECOVERY_PERIOD_YEARS) + 1; // 28 years (first partial + 27 full + last partial)

    let accumulated = 0;

    for (let i = 0; i < totalYears; i++) {
        const year = i + 1;
        const taxYear = startYear + i;

        let yearlyDepreciation: number;

        if (i === 0) {
            // First year - partial using mid-month convention
            yearlyDepreciation = result.firstYearDepreciation;
        } else if (i === totalYears - 1) {
            // Last year - remaining balance
            yearlyDepreciation = result.depreciableValue - accumulated;
        } else {
            // Full years - standard annual amount
            yearlyDepreciation = result.annualDepreciation;
        }

        accumulated += yearlyDepreciation;
        const remaining = result.depreciableValue - accumulated;

        schedule.push({
            year,
            taxYear,
            depreciation: Math.round(yearlyDepreciation * 100) / 100,
            accumulatedDepreciation: Math.round(accumulated * 100) / 100,
            remainingValue: Math.max(0, Math.round(remaining * 100) / 100),
        });

        // Stop if fully depreciated
        if (remaining <= 0.01) break;
    }

    return schedule;
}

/**
 * Get current year depreciation amount
 */
export function getCurrentYearDepreciation(
    inputs: DepreciationInputs,
    currentYear: number = new Date().getFullYear()
): number {
    const schedule = generateDepreciationSchedule(inputs);
    const entry = schedule.find(s => s.taxYear === currentYear);
    return entry?.depreciation || 0;
}

/**
 * Get accumulated depreciation through a specific year
 */
export function getAccumulatedDepreciation(
    inputs: DepreciationInputs,
    throughYear: number = new Date().getFullYear()
): number {
    const schedule = generateDepreciationSchedule(inputs);
    const entry = schedule.find(s => s.taxYear === throughYear);
    return entry?.accumulatedDepreciation || 0;
}

/**
 * Calculate tax savings estimate (simplified)
 * Note: Actual tax savings depend on individual tax situation
 */
export function estimateTaxSavings(
    annualDepreciation: number,
    marginalTaxRate: number = 0.24 // Default to 24% bracket
): number {
    return Math.round(annualDepreciation * marginalTaxRate * 100) / 100;
}
