/**
 * Lease Optimizer
 * Revenue optimization engine with occupancy-based pricing
 * Inspired by AppFolio's Lisa AI leasing assistant
 */

import { prisma } from '@/lib/prisma';
import { getPropertyMarketAnalysis } from '@/lib/services/market-data-service';
import { generatePricingRecommendation, PricingRecommendation } from '@/lib/ai/market-intelligence';

export interface OptimizePriceInput {
    propertyId: string;
    tenantId?: string;
    currentRent: number;
    zipCode: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    occupancyRate: number; // 0-100
}

export interface ConcessionRecommendation {
    type: 'first_month_discount' | 'reduced_deposit' | 'amenity_upgrade' | 'flexible_terms';
    title: string;
    description: string;
    estimatedCost: number;
    expectedImpact: string;
}

export interface LeaseOptimizationResult extends PricingRecommendation {
    concessions?: ConcessionRecommendation[];
    shouldOfferConcession: boolean;
    optimizationId?: string;
}

/**
 * Core optimization function
 * Implements occupancy-based pricing rules:
 * - >85% occupancy → 15% markup potential
 * - <60% occupancy → 5% discount or concessions
 */
export async function OptimizePrice(input: OptimizePriceInput): Promise<LeaseOptimizationResult> {
    const {
        propertyId,
        tenantId,
        currentRent,
        zipCode,
        bedrooms,
        bathrooms,
        squareFeet,
        occupancyRate
    } = input;

    // Get market analysis
    const marketAnalysis = await getPropertyMarketAnalysis(
        zipCode,
        bedrooms,
        bathrooms,
        squareFeet,
        currentRent
    );

    // Generate base pricing recommendation
    const basePricing = await generatePricingRecommendation(
        currentRent,
        marketAnalysis,
        occupancyRate,
        bedrooms,
        squareFeet
    );

    // Apply occupancy-based rules
    let finalRecommendedRent = basePricing.recommendedRent;
    let shouldOfferConcession = false;
    let concessions: ConcessionRecommendation[] = [];
    const additionalReasoning: string[] = [...basePricing.reasoning];

    // HIGH OCCUPANCY RULE (>85%)
    if (occupancyRate > 85) {
        // Strong demand - can push pricing higher
        const maxIncrease = currentRent * 1.15; // Cap at 15% increase

        if (basePricing.marketPosition === 'below_market') {
            // Below market + high occupancy = opportunity
            const marketMedian = marketAnalysis.currentMedianRent;
            const aggressiveTarget = Math.min(marketMedian, maxIncrease);

            if (aggressiveTarget > finalRecommendedRent) {
                finalRecommendedRent = Math.round(aggressiveTarget);
                additionalReasoning.push(
                    `🎯 High Occupancy Strategy: With ${occupancyRate.toFixed(0)}% occupancy, property can support up to 15% rent increase while remaining competitive.`
                );
            }
        } else if (basePricing.marketPosition === 'at_market') {
            // At market + high occupancy = moderate increase
            const moderateIncrease = currentRent * 1.05;
            if (moderateIncrease <= maxIncrease) {
                finalRecommendedRent = Math.round(moderateIncrease);
                additionalReasoning.push(
                    `📈 Market Position: High occupancy supports 5% increase to capitalize on strong demand.`
                );
            }
        }
    }

    // LOW OCCUPANCY RULE (<60%)
    else if (occupancyRate < 60) {
        shouldOfferConcession = true;

        // Generate concession recommendations
        concessions = generateConcessionRecommendations(currentRent, occupancyRate);

        // Aggressive pricing to fill vacancies
        const minDecrease = currentRent * 0.95; // 5% discount floor

        if (basePricing.marketPosition === 'above_market') {
            // Above market + low occupancy = must be competitive
            const marketMedian = marketAnalysis.currentMedianRent;
            const competitivePrice = Math.max(marketMedian * 0.97, minDecrease);
            finalRecommendedRent = Math.round(competitivePrice);

            additionalReasoning.push(
                `⚠️ Low Occupancy Alert: At ${occupancyRate.toFixed(0)}% occupancy, recommend competitive pricing and concessions to attract tenants.`
            );
        } else {
            // Already competitive, offer concessions instead of further price cuts
            additionalReasoning.push(
                `💡 Retention Strategy: Maintain current pricing but offer concessions to improve occupancy from ${occupancyRate.toFixed(0)}%.`
            );
        }

        additionalReasoning.push(
            `🎁 Recommended Concessions: ${concessions.map(c => c.title).join(', ')}`
        );
    }

    // MODERATE OCCUPANCY (60-85%)
    else {
        additionalReasoning.push(
            `✓ Healthy Occupancy: ${occupancyRate.toFixed(0)}% occupancy is within optimal range. Focus on market-aligned pricing.`
        );
    }

    // Recalculate changes with final recommended rent
    const finalChangeAmount = finalRecommendedRent - currentRent;
    const finalChangePercent = (finalChangeAmount / currentRent) * 100;

    // Save optimization to database
    const optimization = await saveOptimization({
        propertyId,
        tenantId,
        currentRent,
        recommendedRent: finalRecommendedRent,
        occupancyRate,
        bedrooms,
        bathrooms,
        squareFeet,
        marketPosition: basePricing.marketPosition,
        confidence: basePricing.confidence,
        reasoning: additionalReasoning,
        insights: basePricing.insights
    });

    return {
        ...basePricing,
        recommendedRent: finalRecommendedRent,
        changeAmount: finalChangeAmount,
        changePercent: finalChangePercent,
        reasoning: additionalReasoning,
        concessions,
        shouldOfferConcession,
        optimizationId: optimization.id
    };
}

/**
 * Generate concession recommendations for low occupancy
 */
function generateConcessionRecommendations(
    currentRent: number,
    occupancyRate: number
): ConcessionRecommendation[] {
    const concessions: ConcessionRecommendation[] = [];

    // First month discount (most common)
    concessions.push({
        type: 'first_month_discount',
        title: '$500 Off First Month',
        description: 'Reduce first month rent by $500 to attract new tenants quickly',
        estimatedCost: 500,
        expectedImpact: 'High - Proven to reduce vacancy time by 30-40%'
    });

    // Reduced deposit (if occupancy very low)
    if (occupancyRate < 50) {
        concessions.push({
            type: 'reduced_deposit',
            title: 'Reduced Security Deposit',
            description: 'Lower security deposit from 1 month to 0.5 month rent',
            estimatedCost: currentRent * 0.5,
            expectedImpact: 'Medium - Lowers barrier to entry for qualified tenants'
        });
    }

    // Amenity upgrade
    concessions.push({
        type: 'amenity_upgrade',
        title: 'Free Parking or Storage',
        description: 'Include parking space or storage unit at no additional cost',
        estimatedCost: 50, // Opportunity cost per month
        expectedImpact: 'Medium - Adds perceived value without direct cost'
    });

    // Flexible terms
    if (occupancyRate < 55) {
        concessions.push({
            type: 'flexible_terms',
            title: 'Flexible Lease Terms',
            description: 'Offer 6-month or month-to-month options for flexibility',
            estimatedCost: 0,
            expectedImpact: 'Low-Medium - Appeals to tenants seeking short-term options'
        });
    }

    return concessions;
}

/**
 * Save optimization to database
 */
async function saveOptimization(data: {
    propertyId: string;
    tenantId?: string;
    currentRent: number;
    recommendedRent: number;
    occupancyRate: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    marketPosition: string;
    confidence: string;
    reasoning: string[];
    insights: Array<{
        type: string;
        title: string;
        description: string;
        impact: string;
    }>;
}) {
    const changeAmount = data.recommendedRent - data.currentRent;
    const changePercent = (changeAmount / data.currentRent) * 100;

    return await prisma.leaseOptimization.create({
        data: {
            propertyId: data.propertyId,
            tenantId: data.tenantId,
            currentRent: data.currentRent,
            recommendedRent: data.recommendedRent,
            changeAmount,
            changePercent,
            occupancyRate: data.occupancyRate,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.squareFeet,
            marketPosition: data.marketPosition,
            confidence: data.confidence,
            reasoning: JSON.stringify(data.reasoning),
            insights: JSON.stringify(data.insights),
            status: 'pending'
        }
    });
}

/**
 * Get optimization history for a property
 */
export async function getOptimizationHistory(propertyId: string, limit: number = 10) {
    return await prisma.leaseOptimization.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            tenant: {
                select: {
                    name: true,
                    apartmentNumber: true
                }
            }
        }
    });
}

/**
 * Approve an optimization recommendation
 */
export async function approveOptimization(
    optimizationId: string,
    reviewedBy: string
): Promise<{ success: boolean; message: string }> {
    const optimization = await prisma.leaseOptimization.findUnique({
        where: { id: optimizationId },
        include: { tenant: true }
    });

    if (!optimization) {
        return { success: false, message: 'Optimization not found' };
    }

    if (optimization.status !== 'pending') {
        return { success: false, message: 'Optimization already processed' };
    }

    // Update optimization status
    await prisma.leaseOptimization.update({
        where: { id: optimizationId },
        data: {
            status: 'approved',
            reviewedBy,
            reviewedAt: new Date()
        }
    });

    // Update tenant rent if tenant exists
    if (optimization.tenantId) {
        await prisma.tenant.update({
            where: { id: optimization.tenantId },
            data: {
                rentAmount: optimization.recommendedRent
            }
        });
    }

    const changeAmount = optimization.recommendedRent - optimization.currentRent;

    return {
        success: true,
        message: `Optimization approved. Rent ${changeAmount > 0 ? 'increased' : 'decreased'} by $${Math.abs(changeAmount).toFixed(2)}`
    };
}

/**
 * Reject an optimization recommendation
 */
export async function rejectOptimization(
    optimizationId: string,
    reviewedBy: string
): Promise<{ success: boolean; message: string }> {
    const optimization = await prisma.leaseOptimization.findUnique({
        where: { id: optimizationId }
    });

    if (!optimization) {
        return { success: false, message: 'Optimization not found' };
    }

    await prisma.leaseOptimization.update({
        where: { id: optimizationId },
        data: {
            status: 'rejected',
            reviewedBy,
            reviewedAt: new Date()
        }
    });

    return { success: true, message: 'Optimization rejected' };
}

/**
 * Calculate property-wide occupancy rate
 */
export async function calculatePropertyOccupancy(propertyId: string): Promise<number> {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            tenants: {
                where: {
                    status: 'active'
                }
            }
        }
    });

    if (!property) return 0;

    const totalUnits = property.units || 1;
    const occupiedUnits = property.tenants.length;

    return (occupiedUnits / totalUnits) * 100;
}
