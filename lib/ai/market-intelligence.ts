/**
 * Market Intelligence Engine
 * AI-powered analysis of market data for lease optimization
 */

import { MarketAnalysis, ComparableProperty } from '@/lib/services/market-data-service';

export interface MarketInsight {
    type: 'opportunity' | 'warning' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
}

export interface PricingRecommendation {
    recommendedRent: number;
    currentRent: number;
    changeAmount: number;
    changePercent: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string[];
    marketPosition: 'above_market' | 'at_market' | 'below_market';
    insights: MarketInsight[];
}

/**
 * Calculate market growth velocity
 * Measures the rate of rent increase over time
 */
export function calculateMarketGrowthVelocity(marketAnalysis: MarketAnalysis): number {
    return marketAnalysis.marketGrowthVelocity;
}

/**
 * Analyze market position of current rent
 */
export function analyzeMarketPosition(
    currentRent: number,
    marketMedian: number,
    comparables: ComparableProperty[]
): {
    position: 'above_market' | 'at_market' | 'below_market';
    percentile: number;
    reasoning: string;
} {
    const diff = currentRent - marketMedian;
    const percentDiff = (diff / marketMedian) * 100;

    // Calculate percentile based on comparables
    const allRents = [...comparables.map(c => c.rentAmount), currentRent].sort((a, b) => a - b);
    const currentIndex = allRents.indexOf(currentRent);
    const percentile = (currentIndex / (allRents.length - 1)) * 100;

    let position: 'above_market' | 'at_market' | 'below_market';
    let reasoning: string;

    if (percentDiff > 10) {
        position = 'above_market';
        reasoning = `Current rent is ${Math.abs(percentDiff).toFixed(1)}% above market median ($${marketMedian}). Property is in the ${percentile.toFixed(0)}th percentile.`;
    } else if (percentDiff < -10) {
        position = 'below_market';
        reasoning = `Current rent is ${Math.abs(percentDiff).toFixed(1)}% below market median ($${marketMedian}). Significant opportunity for optimization.`;
    } else {
        position = 'at_market';
        reasoning = `Current rent is within 10% of market median ($${marketMedian}), indicating competitive pricing.`;
    }

    return { position, percentile, reasoning };
}

/**
 * Generate market insights from analysis
 */
export function generateMarketInsights(
    marketAnalysis: MarketAnalysis,
    currentRent: number,
    // _occupancyRate: number
): MarketInsight[] {
    const insights: MarketInsight[] = [];

    // Growth velocity insight
    if (marketAnalysis.marketGrowthVelocity > 5) {
        insights.push({
            type: 'opportunity',
            title: 'Strong Market Growth',
            description: `Market rents are growing at ${marketAnalysis.marketGrowthVelocity.toFixed(1)}% annually. Consider rent increases for lease renewals.`,
            impact: 'high'
        });
    } else if (marketAnalysis.marketGrowthVelocity < 1) {
        insights.push({
            type: 'warning',
            title: 'Slow Market Growth',
            description: `Market growth is only ${marketAnalysis.marketGrowthVelocity.toFixed(1)}% annually. Focus on tenant retention over rent increases.`,
            impact: 'medium'
        });
    }

    // Vacancy rate insight
    if (marketAnalysis.vacancyRate < 5) {
        insights.push({
            type: 'opportunity',
            title: 'Low Vacancy Rate',
            description: `Market vacancy is ${marketAnalysis.vacancyRate.toFixed(1)}%, indicating high demand. Strong position for rent optimization.`,
            impact: 'high'
        });
    } else if (marketAnalysis.vacancyRate > 10) {
        insights.push({
            type: 'warning',
            title: 'High Vacancy Rate',
            description: `Market vacancy is ${marketAnalysis.vacancyRate.toFixed(1)}%. Consider competitive pricing or concessions.`,
            impact: 'high'
        });
    }

    // Days on market insight
    if (marketAnalysis.daysOnMarket < 20) {
        insights.push({
            type: 'opportunity',
            title: 'Fast Market',
            description: `Properties are renting in ${marketAnalysis.daysOnMarket} days on average. High demand market.`,
            impact: 'medium'
        });
    } else if (marketAnalysis.daysOnMarket > 40) {
        insights.push({
            type: 'warning',
            title: 'Slow Market',
            description: `Properties are taking ${marketAnalysis.daysOnMarket} days to rent. May need competitive pricing.`,
            impact: 'medium'
        });
    }

    // Pricing position insight
    const position = analyzeMarketPosition(currentRent, marketAnalysis.currentMedianRent, marketAnalysis.comparables);
    if (position.position === 'below_market') {
        insights.push({
            type: 'opportunity',
            title: 'Below Market Pricing',
            description: position.reasoning,
            impact: 'high'
        });
    } else if (position.position === 'above_market') {
        insights.push({
            type: 'warning',
            title: 'Above Market Pricing',
            description: position.reasoning,
            impact: 'medium'
        });
    }

    return insights;
}

/**
 * Find best comparable properties
 * Filters and ranks comparables by relevance
 */
export function findBestComparables(
    comparables: ComparableProperty[],
    targetBedrooms: number,
    targetSquareFeet: number,
    maxDistance: number = 2.0,
    limit: number = 3
): ComparableProperty[] {
    return comparables
        .filter(comp => comp.distance <= maxDistance)
        .map(comp => {
            // Calculate relevance score
            const bedroomMatch = comp.bedrooms === targetBedrooms ? 1 : 0.7;
            const sqftDiff = Math.abs(comp.squareFeet - targetSquareFeet) / targetSquareFeet;
            const sqftMatch = Math.max(0, 1 - sqftDiff);
            const distanceScore = 1 - (comp.distance / maxDistance);

            const relevanceScore = (bedroomMatch * 0.4) + (sqftMatch * 0.4) + (distanceScore * 0.2);

            return { ...comp, relevanceScore };
        })
        .sort((a, b) => ((b as ComparableProperty & { relevanceScore: number }).relevanceScore) - ((a as ComparableProperty & { relevanceScore: number }).relevanceScore))
        .slice(0, limit);
}

/**
 * Generate AI reasoning for pricing recommendation
 */
export function generatePricingReasoning(
    currentRent: number,
    recommendedRent: number,
    marketAnalysis: MarketAnalysis,
    occupancyRate: number,
    bestComps: ComparableProperty[]
): string[] {
    const reasoning: string[] = [];
    const changePercent = ((recommendedRent - currentRent) / currentRent) * 100;

    // Market position reasoning
    const position = analyzeMarketPosition(currentRent, marketAnalysis.currentMedianRent, marketAnalysis.comparables);
    reasoning.push(position.reasoning);

    // Comparable properties reasoning
    if (bestComps.length > 0) {
        const avgCompRent = bestComps.reduce((sum, c) => sum + c.rentAmount, 0) / bestComps.length;
        reasoning.push(
            `Nearby comparable properties (within ${Math.max(...bestComps.map(c => c.distance)).toFixed(1)} miles) average $${Math.round(avgCompRent)}/month.`
        );

        // List top comps
        bestComps.slice(0, 2).forEach(comp => {
            reasoning.push(
                `• ${comp.address} (${comp.distance}mi): ${comp.bedrooms}bd/${comp.bathrooms}ba, ${comp.squareFeet}sqft - $${comp.rentAmount}/mo`
            );
        });
    }

    // Market growth reasoning
    if (marketAnalysis.marketGrowthVelocity > 3) {
        reasoning.push(
            `Market is growing at ${marketAnalysis.marketGrowthVelocity.toFixed(1)}% annually, supporting ${changePercent > 0 ? 'rent increases' : 'current pricing'}.`
        );
    }

    // Occupancy reasoning
    if (occupancyRate > 85) {
        reasoning.push(
            `Property occupancy is ${occupancyRate.toFixed(0)}%, indicating strong demand and pricing power.`
        );
    } else if (occupancyRate < 60) {
        reasoning.push(
            `Property occupancy is ${occupancyRate.toFixed(0)}%, suggesting need for competitive pricing or concessions.`
        );
    }

    // Vacancy rate reasoning
    if (marketAnalysis.vacancyRate < 5) {
        reasoning.push(
            `Low market vacancy rate (${marketAnalysis.vacancyRate.toFixed(1)}%) supports premium pricing.`
        );
    }

    // Recommendation summary
    if (changePercent > 0) {
        reasoning.push(
            `Recommendation: Increase rent by $${Math.round(recommendedRent - currentRent)} (${changePercent.toFixed(1)}%) to align with market conditions.`
        );
    } else if (changePercent < 0) {
        reasoning.push(
            `Recommendation: Decrease rent by $${Math.round(Math.abs(recommendedRent - currentRent))} (${Math.abs(changePercent).toFixed(1)}%) to improve competitiveness.`
        );
    } else {
        reasoning.push('Current pricing is optimal for market conditions.');
    }

    return reasoning;
}

/**
 * Calculate confidence score for recommendation
 */
export function calculateRecommendationConfidence(
    marketAnalysis: MarketAnalysis,
    comparablesCount: number,
    occupancyDataAvailable: boolean
): 'HIGH' | 'MEDIUM' | 'LOW' {
    let score = 0;

    // Market data confidence
    if (marketAnalysis.confidence === 'HIGH') score += 3;
    else if (marketAnalysis.confidence === 'MEDIUM') score += 2;
    else score += 1;

    // Comparables availability
    if (comparablesCount >= 3) score += 2;
    else if (comparablesCount >= 1) score += 1;

    // Occupancy data
    if (occupancyDataAvailable) score += 1;

    // Score to confidence mapping
    if (score >= 5) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
}

/**
 * Main function: Generate comprehensive pricing recommendation
 */
export async function generatePricingRecommendation(
    currentRent: number,
    marketAnalysis: MarketAnalysis,
    occupancyRate: number,
    bedrooms: number,
    squareFeet: number
): Promise<PricingRecommendation> {
    // Find best comparable properties
    const bestComps = findBestComparables(
        marketAnalysis.comparables,
        bedrooms,
        squareFeet,
        2.0,
        3
    );

    // Calculate recommended rent based on market position
    const position = analyzeMarketPosition(currentRent, marketAnalysis.currentMedianRent, marketAnalysis.comparables);

    let recommendedRent = currentRent;

    // Apply occupancy-based adjustments
    if (occupancyRate > 85 && position.position === 'below_market') {
        // High occupancy + below market = opportunity for increase
        const avgCompRent = bestComps.length > 0
            ? bestComps.reduce((sum, c) => sum + c.rentAmount, 0) / bestComps.length
            : marketAnalysis.currentMedianRent;

        // Move toward market median, but cap at 15% increase
        const targetRent = Math.min(avgCompRent, currentRent * 1.15);
        recommendedRent = Math.round(targetRent);
    } else if (occupancyRate < 60 && position.position !== 'below_market') {
        // Low occupancy = need competitive pricing
        // Recommend 5% decrease or move to market median, whichever is less aggressive
        const fivePercentDecrease = currentRent * 0.95;
        recommendedRent = Math.round(Math.max(fivePercentDecrease, marketAnalysis.currentMedianRent));
    } else if (position.position === 'below_market' && marketAnalysis.marketGrowthVelocity > 4) {
        // Below market in growing market = gradual increase
        const targetRent = Math.min(marketAnalysis.currentMedianRent, currentRent * 1.10);
        recommendedRent = Math.round(targetRent);
    }

    // Calculate changes
    const changeAmount = recommendedRent - currentRent;
    const changePercent = (changeAmount / currentRent) * 100;

    // Generate insights
    const insights = generateMarketInsights(marketAnalysis, currentRent);

    // Generate reasoning
    const reasoning = generatePricingReasoning(
        currentRent,
        recommendedRent,
        marketAnalysis,
        occupancyRate,
        bestComps
    );

    // Calculate confidence
    const confidence = calculateRecommendationConfidence(
        marketAnalysis,
        bestComps.length,
        true
    );

    return {
        recommendedRent,
        currentRent,
        changeAmount,
        changePercent,
        confidence,
        reasoning,
        marketPosition: position.position,
        insights
    };
}
