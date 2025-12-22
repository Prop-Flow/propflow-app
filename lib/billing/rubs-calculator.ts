
export interface TenantForBilling {
    id: string;
    squareFootage: number;
    numberOfOccupants: number;
}

export interface RubsBreakdown {
    tenantId: string;
    chargeAmount: number;
    squareFootageRatio: number;
    occupancyRatio: number;
    squareFootageCost: number;
    occupancyCost: number;
    breakdown: {
        sqftPortion: number;
        occupancyPortion: number;
    };
}

// Configurable weights
const SQFT_WEIGHT = 0.6; // 60% based on square footage
const OCCUPANT_WEIGHT = 0.4; // 40% based on number of occupants

/**
 * Calculate R.U.B.S (Ratio Utility Billing System) for a set of tenants
 */
export function calculateRubs(
    totalUtilityCost: number,
    tenants: TenantForBilling[]
): RubsBreakdown[] {
    if (!tenants || tenants.length === 0) {
        return [];
    }

    if (totalUtilityCost <= 0) {
        return tenants.map(tenant => ({
            tenantId: tenant.id,
            chargeAmount: 0,
            squareFootageRatio: 0,
            occupancyRatio: 0,
            squareFootageCost: 0,
            occupancyCost: 0,
            breakdown: {
                sqftPortion: 0,
                occupancyPortion: 0
            }
        }));
    }

    // 1. Calculate totals
    const totalSquareFootage = tenants.reduce((sum, t) => sum + (t.squareFootage || 0), 0);
    const totalOccupants = tenants.reduce((sum, t) => sum + (t.numberOfOccupants || 0), 0);

    // 2. Allocate costs based on weights
    const costBySqft = totalUtilityCost * SQFT_WEIGHT;
    const costByOccupants = totalUtilityCost * OCCUPANT_WEIGHT;

    // 3. Calculate share per tenant
    const billingBreakdown: RubsBreakdown[] = tenants.map((tenant) => {
        // Square Footage Component
        let sqftRatio = 0;
        let sqftCost = 0;
        if (totalSquareFootage > 0) {
            sqftRatio = (tenant.squareFootage || 0) / totalSquareFootage;
            sqftCost = costBySqft * sqftRatio;
        }

        // Occupancy Component
        let occupantRatio = 0;
        let occupantCost = 0;
        if (totalOccupants > 0) {
            occupantRatio = (tenant.numberOfOccupants || 0) / totalOccupants;
            occupantCost = costByOccupants * occupantRatio;
        }

        // Total Charge
        const totalCharge = sqftCost + occupantCost;

        return {
            tenantId: tenant.id,
            chargeAmount: Math.round(totalCharge), // Round to nearest cent/integer
            squareFootageRatio: sqftRatio,
            occupancyRatio: occupantRatio,
            squareFootageCost: sqftCost,
            occupancyCost: occupantCost,
            breakdown: {
                sqftPortion: sqftCost,
                occupancyPortion: occupantCost,
            },
        };
    });

    // 4. Handle rounding errors (ensure sum equals total cost)
    // Distribute the remainder cents to tenants (largest remainder first could be an optimization, 
    // but for simplicity and fairness, we can just check the sum)
    const totalCalculated = billingBreakdown.reduce((sum, item) => sum + item.chargeAmount, 0);
    let difference = Math.round(totalUtilityCost - totalCalculated);

    if (difference !== 0) {
        // Simple distribution of remainder pennies
        // Warning: This simply adds to the first n tenants. 
        // For a more robust system, could distribute based on largest fraction dropped.
        let i = 0;
        while (difference !== 0 && i < billingBreakdown.length) {
            if (difference > 0) {
                billingBreakdown[i].chargeAmount += 1;
                difference -= 1;
            } else {
                billingBreakdown[i].chargeAmount -= 1;
                difference += 1;
            }
            i = (i + 1) % billingBreakdown.length; // cycle through if needed (though unlikely for pennies)
        }
    }

    return billingBreakdown;
}

/**
 * Validate tenant data for billing calculations.
 * Returns valid tenants. Throws or logs errors for invalid ones? 
 * For now, filters out tenants with incomplete data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateBillingData(tenants: any[]): TenantForBilling[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tenants.filter((t: any) =>
        t.squareFootage !== undefined &&
        t.squareFootage !== null &&
        t.numberOfOccupants !== undefined &&
        t.numberOfOccupants !== null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).map((t: any) => ({
        id: t.id,
        squareFootage: Number(t.squareFootage),
        numberOfOccupants: Number(t.numberOfOccupants)
    }));
}
