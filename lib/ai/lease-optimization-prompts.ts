/**
 * Lease Optimization AI Prompts
 * Specialized prompts for lease pricing and optimization scenarios
 */

export const LEASE_OPTIMIZATION_PROMPT = `You are an AI property management advisor specializing in lease optimization and revenue management.

Your role is to:
- Analyze market conditions and property performance
- Recommend optimal pricing strategies
- Explain reasoning in clear, actionable terms
- Balance revenue optimization with tenant retention

Key principles:
- High occupancy (>85%) indicates pricing power
- Low occupancy (<60%) requires competitive pricing or concessions
- Market growth velocity affects renewal pricing
- Comparable properties guide pricing decisions

Always provide:
1. Clear recommendation with specific dollar amount
2. Market data supporting the recommendation
3. Expected impact on revenue and occupancy
4. Risk assessment and alternative strategies
`;

export const MARKET_ANALYSIS_EXPLANATION_PROMPT = `Explain the following market analysis in simple, owner-friendly language:

Market Data:
- Median Rent: {medianRent}
- Growth Rate: {growthRate}% annually
- Vacancy Rate: {vacancyRate}%
- Days on Market: {daysOnMarket}

Property Data:
- Current Rent: {currentRent}
- Occupancy: {occupancy}%
- Market Position: {marketPosition}

Provide:
1. What this means for the property (2-3 sentences)
2. Key opportunities or concerns (bullet points)
3. Recommended action (1 sentence)

Keep it concise and actionable.`;

export const PRICING_REASONING_PROMPT = `Generate clear reasoning for the following pricing recommendation:

Current Rent: {currentRent}
Recommended Rent: {recommendedRent}
Change: {changePercent}%

Market Context:
- Median Market Rent: {marketMedian}
- Market Growth: {growthRate}% annually
- Property Occupancy: {occupancy}%

Nearby Comparables:
{comparables}

Provide 3-5 bullet points explaining:
1. How the recommendation aligns with market data
2. Why this pricing makes sense for current occupancy
3. Expected impact on revenue and tenant retention
4. Key comparable properties supporting this price

Use specific numbers and be persuasive but honest.`;

export const CONCESSION_RECOMMENDATION_PROMPT = `Recommend lease concessions for a property with low occupancy:

Property Details:
- Current Rent: {currentRent}
- Occupancy Rate: {occupancyRate}%
- Market Vacancy: {marketVacancy}%
- Days Vacant: {daysVacant}

Suggest 2-3 concessions that:
1. Are cost-effective
2. Attract quality tenants quickly
3. Don't devalue the property long-term

For each concession provide:
- Type (e.g., "First Month Discount")
- Specific offer (e.g., "$500 off first month")
- Estimated cost
- Expected impact on lease-up time

Format as JSON array.`;

export const RENEWAL_STRATEGY_PROMPT = `Create a lease renewal strategy for:

Tenant: {tenantName}
Current Rent: {currentRent}
Lease Expires: {expirationDate}
Time Until Expiration: {daysUntil} days

Market Conditions:
- Market Median: {marketMedian}
- Market Growth: {growthRate}%
- Property Occupancy: {propertyOccupancy}%

Tenant History:
- Payment History: {paymentHistory}
- Maintenance Requests: {maintenanceCount}
- Lease Duration: {leaseDuration} months

Recommend:
1. Renewal rent amount with justification
2. Timing for renewal offer (days before expiration)
3. Negotiation strategy if tenant pushes back
4. Alternative concessions if rent increase is rejected

Focus on retention while optimizing revenue.`;

export const OWNER_COMMUNICATION_PROMPT = `Draft a message to the property owner about this lease optimization:

Recommendation: {recommendation}
Current Rent: {currentRent}
Proposed Rent: {proposedRent}
Impact: {impactDescription}

Market Support:
{marketData}

Tone: Professional, confident, data-driven
Length: 3-4 paragraphs
Include: 
- Clear recommendation
- Market justification
- Expected financial impact
- Next steps

Make it compelling and easy to approve.`;

export const TENANT_NEGOTIATION_PROMPT = `Provide negotiation guidance for this scenario:

Situation: {situation}
Tenant Response: {tenantResponse}
Current Offer: {currentOffer}
Market Position: {marketPosition}

Suggest:
1. Counter-offer strategy
2. Concessions to offer (if any)
3. Walk-away point
4. Communication approach

Balance: Revenue optimization vs. tenant retention
Consider: Cost of vacancy vs. concession cost

Provide specific dollar amounts and talking points.`;

/**
 * Build a complete lease optimization prompt
 */
export function buildLeaseOptimizationPrompt(
    scenario: 'pricing' | 'concession' | 'renewal' | 'negotiation',
    context: Record<string, string | number>
): string {
    const basePrompt = LEASE_OPTIMIZATION_PROMPT;
    let specificPrompt = '';

    switch (scenario) {
        case 'pricing':
            specificPrompt = PRICING_REASONING_PROMPT;
            break;
        case 'concession':
            specificPrompt = CONCESSION_RECOMMENDATION_PROMPT;
            break;
        case 'renewal':
            specificPrompt = RENEWAL_STRATEGY_PROMPT;
            break;
        case 'negotiation':
            specificPrompt = TENANT_NEGOTIATION_PROMPT;
            break;
    }

    // Replace template variables
    let prompt = `${basePrompt}\n\n${specificPrompt}`;

    for (const [key, value] of Object.entries(context)) {
        const placeholder = `{${key}}`;
        const dollarPlaceholder = `\${${key}}`;
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
        prompt = prompt.replace(new RegExp(dollarPlaceholder.replace(/\$/g, '\\$'), 'g'), String(value));
    }

    return prompt;
}

/**
 * Generate market insights summary for owners
 */
export function buildMarketInsightsSummary(marketData: {
    medianRent: number;
    growthRate: number;
    vacancyRate: number;
    daysOnMarket: number;
    currentRent: number;
    occupancy: number;
    marketPosition: string;
}): string {
    const template = MARKET_ANALYSIS_EXPLANATION_PROMPT;

    return template
        .replace('{medianRent}', `$${marketData.medianRent}`)
        .replace('{growthRate}', marketData.growthRate.toFixed(1))
        .replace('{vacancyRate}', marketData.vacancyRate.toFixed(1))
        .replace('{daysOnMarket}', String(marketData.daysOnMarket))
        .replace('{currentRent}', `$${marketData.currentRent}`)
        .replace('{occupancy}', marketData.occupancy.toFixed(0))
        .replace('{marketPosition}', marketData.marketPosition);
}
