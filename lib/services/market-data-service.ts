/**
 * Market Data Service
 * RentCast-compatible interface for market intelligence
 * Uses mock data for development, easily swappable to real API
 */

// RentCast-compatible data structures
export interface MarketTrendData {
    zipCode: string;
    month: string; // YYYY-MM format
    medianRent: number;
    averageRent: number;
    sampleSize: number;
}

export interface ComparableProperty {
    address: string;
    distance: number; // miles
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    rentAmount: number;
    listingDate: string;
}

export interface MarketAnalysis {
    zipCode: string;
    currentMedianRent: number;
    marketGrowthVelocity: number; // % annual growth rate
    trends12Month: MarketTrendData[];
    comparables: ComparableProperty[];
    vacancyRate: number;
    daysOnMarket: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarketDataServiceConfig {
    useRealAPI: boolean;
    apiKey?: string;
    mockDataSeed?: number;
}

/**
 * Mock data generator for development
 * Generates realistic market data based on property location
 */
export class MockMarketDataGenerator {
    private seed: number;

    constructor(seed: number = Date.now()) {
        this.seed = seed;
    }

    // Seeded random number generator for consistent mock data
    private random(): number {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    private randomInRange(min: number, max: number): number {
        return min + this.random() * (max - min);
    }

    /**
     * Generate 12-month historical rent trends
     */
    generate12MonthTrends(zipCode: string, baseRent: number): MarketTrendData[] {
        const trends: MarketTrendData[] = [];
        const now = new Date();

        // Base growth rate varies by zip code (simulated)
        const zipSeed = parseInt(zipCode.slice(0, 3)) || 100;
        this.seed = zipSeed;
        const annualGrowthRate = this.randomInRange(2, 8); // 2-8% annual growth
        const monthlyGrowthRate = annualGrowthRate / 12 / 100;

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Calculate historical rent with growth and some variance
            const monthsAgo = i;
            const trendRent = baseRent * Math.pow(1 - monthlyGrowthRate, monthsAgo);
            const variance = this.randomInRange(-50, 50);
            const medianRent = Math.round(trendRent + variance);
            const averageRent = Math.round(medianRent * this.randomInRange(1.02, 1.08));

            trends.push({
                zipCode,
                month: monthStr,
                medianRent,
                averageRent,
                sampleSize: Math.floor(this.randomInRange(20, 100))
            });
        }

        return trends;
    }

    /**
     * Generate comparable properties
     */
    generateComparables(
        zipCode: string,
        bedrooms: number,
        bathrooms: number,
        squareFeet: number,
        baseRent: number,
        count: number = 5
    ): ComparableProperty[] {
        const comparables: ComparableProperty[] = [];
        const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Ln', 'Cedar Ct', 'Elm St', 'Park Ave'];

        for (let i = 0; i < count; i++) {
            const distance = this.randomInRange(0.1, 3.5);
            const sqftVariance = this.randomInRange(0.85, 1.15);
            const compSqft = Math.round(squareFeet * sqftVariance);

            // Rent varies based on size and distance
            const sizeAdjustment = (compSqft / squareFeet);
            const distanceAdjustment = 1 - (distance * 0.02); // Slight decrease with distance
            const compRent = Math.round(baseRent * sizeAdjustment * distanceAdjustment * this.randomInRange(0.95, 1.05));

            const streetNum = Math.floor(this.randomInRange(100, 9999));
            const street = streets[Math.floor(this.random() * streets.length)];

            comparables.push({
                address: `${streetNum} ${street}`,
                distance: Math.round(distance * 10) / 10,
                bedrooms: bedrooms + (this.random() > 0.7 ? (this.random() > 0.5 ? 1 : -1) : 0),
                bathrooms: bathrooms + (this.random() > 0.8 ? 0.5 : 0),
                squareFeet: compSqft,
                rentAmount: compRent,
                listingDate: this.generateRecentDate()
            });
        }

        // Sort by distance
        return comparables.sort((a, b) => a.distance - b.distance);
    }

    private generateRecentDate(): string {
        const daysAgo = Math.floor(this.randomInRange(1, 90));
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }

    /**
     * Calculate market growth velocity from trends
     */
    calculateGrowthVelocity(trends: MarketTrendData[]): number {
        if (trends.length < 2) return 0;

        const oldest = trends[0];
        const newest = trends[trends.length - 1];
        const monthsDiff = trends.length - 1;

        const totalGrowth = (newest.medianRent - oldest.medianRent) / oldest.medianRent;
        const annualGrowth = (totalGrowth / monthsDiff) * 12 * 100;

        return Math.round(annualGrowth * 10) / 10;
    }
}

/**
 * Market Data Service
 * Main service for fetching market intelligence
 */
export class MarketDataService {
    private config: MarketDataServiceConfig;
    private mockGenerator: MockMarketDataGenerator;

    constructor(config: MarketDataServiceConfig = { useRealAPI: false }) {
        this.config = config;
        this.mockGenerator = new MockMarketDataGenerator(config.mockDataSeed);
    }

    /**
     * Get market analysis for a property
     */
    async getMarketAnalysis(
        zipCode: string,
        bedrooms: number,
        bathrooms: number,
        squareFeet: number,
        currentRent?: number
    ): Promise<MarketAnalysis> {
        if (this.config.useRealAPI && this.config.apiKey) {
            return this.fetchRealMarketData();
        }

        return this.generateMockMarketData(zipCode, bedrooms, bathrooms, squareFeet, currentRent);
    }

    /**
     * Generate mock market data (development mode)
     */
    private async generateMockMarketData(
        zipCode: string,
        bedrooms: number,
        bathrooms: number,
        squareFeet: number,
        currentRent?: number
    ): Promise<MarketAnalysis> {
        // Estimate base rent if not provided
        const baseRent = currentRent || this.estimateBaseRent(bedrooms, squareFeet, zipCode);

        // Generate 12-month trends
        const trends = this.mockGenerator.generate12MonthTrends(zipCode, baseRent);

        // Calculate growth velocity
        const growthVelocity = this.mockGenerator.calculateGrowthVelocity(trends);

        // Generate comparables
        const comparables = this.mockGenerator.generateComparables(
            zipCode,
            bedrooms,
            bathrooms,
            squareFeet,
            baseRent,
            6
        );

        // Current median from latest trend
        const currentMedianRent = trends[trends.length - 1].medianRent;

        // Mock vacancy and days on market
        const vacancyRate = this.mockGenerator['randomInRange'](3, 8);
        const daysOnMarket = Math.floor(this.mockGenerator['randomInRange'](15, 45));

        return {
            zipCode,
            currentMedianRent,
            marketGrowthVelocity: growthVelocity,
            trends12Month: trends,
            comparables,
            vacancyRate: Math.round(vacancyRate * 10) / 10,
            daysOnMarket,
            confidence: 'HIGH' // Mock data always high confidence
        };
    }

    /**
     * Estimate base rent from property characteristics
     */
    private estimateBaseRent(bedrooms: number, squareFeet: number, zipCode: string): number {
        // Simple estimation formula
        // Base: $1.20 per sqft, adjusted by bedrooms and zip code
        const zipMultiplier = this.getZipCodeMultiplier(zipCode);
        const bedroomBonus = bedrooms * 150;
        const sqftRate = 1.20 * zipMultiplier;

        return Math.round(squareFeet * sqftRate + bedroomBonus);
    }

    /**
     * Get zip code multiplier for rent estimation
     */
    private getZipCodeMultiplier(zipCode: string): number {
        // Simple heuristic based on first digit
        const firstDigit = parseInt(zipCode.charAt(0));

        // Higher cost areas (0-2: Northeast, 9: West Coast)
        if ([0, 1, 2, 9].includes(firstDigit)) return 1.3;

        // Medium cost areas
        if ([3, 4, 5].includes(firstDigit)) return 1.0;

        // Lower cost areas
        return 0.85;
    }

    /**
     * Fetch real market data from RentCast API
     * TODO: Implement when API credentials are available
     */
    private async fetchRealMarketData(): Promise<MarketAnalysis> {
        // Placeholder for real API integration
        // When ready, implement:
        // 1. Call RentCast /markets endpoint for trends
        // 2. Call RentCast /properties/search for comparables
        // 3. Transform response to MarketAnalysis format

        throw new Error('Real RentCast API integration not yet implemented. Set useRealAPI: false for mock data.');
    }
}

// Singleton instance for easy import
let serviceInstance: MarketDataService | null = null;

export function getMarketDataService(config?: MarketDataServiceConfig): MarketDataService {
    if (!serviceInstance) {
        serviceInstance = new MarketDataService(config);
    }
    return serviceInstance;
}

// Helper function to get market analysis
export async function getPropertyMarketAnalysis(
    zipCode: string,
    bedrooms: number,
    bathrooms: number,
    squareFeet: number,
    currentRent?: number
): Promise<MarketAnalysis> {
    const service = getMarketDataService();
    return service.getMarketAnalysis(zipCode, bedrooms, bathrooms, squareFeet, currentRent);
}
