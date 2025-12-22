/**
 * Test Suite for Property Depreciation Calculator
 * Validates calculations against IRS Publication 527 examples
 */

import {
    calculateDepreciation,
    generateDepreciationSchedule,
    getCurrentYearDepreciation,
    getAccumulatedDepreciation,
} from '../depreciation-calculator';

describe('Depreciation Calculator', () => {
    describe('calculateDepreciation', () => {
        it('should calculate correct depreciation for standard example', () => {
            // IRS Example: $500,000 purchase, 80/20 building/land split
            const result = calculateDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            expect(result.purchasePrice).toBe(500000);
            expect(result.landValue).toBe(100000); // 20% of purchase
            expect(result.buildingValue).toBe(400000); // 80% of purchase
            expect(result.depreciableValue).toBe(400000);
            expect(result.annualDepreciation).toBeCloseTo(14545.45, 2);
            expect(result.recoveryPeriod).toBe(27.5);
        });

        it('should apply mid-month convention correctly for January purchase', () => {
            const result = calculateDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            // January purchase = 11.5 months in first year
            expect(result.monthsInFirstYear).toBeCloseTo(11.5, 1);
            expect(result.firstYearDepreciation).toBeCloseTo(13940.91, 2);
        });

        it('should apply mid-month convention correctly for June purchase', () => {
            const result = calculateDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-06-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            // June purchase = 6.5 months in first year
            expect(result.monthsInFirstYear).toBeCloseTo(6.5, 1);
            expect(result.firstYearDepreciation).toBeCloseTo(7878.79, 2);
        });

        it('should handle different land/building ratios', () => {
            // 70/30 split
            const result = calculateDepreciation({
                purchasePrice: 600000,
                purchaseDate: new Date('2024-03-01'),
                assessedLandValue: 180000, // 30%
                assessedBuildingValue: 420000, // 70%
            });

            expect(result.landValue).toBe(180000);
            expect(result.buildingValue).toBe(420000);
            expect(result.depreciableValue).toBe(420000);
            expect(result.annualDepreciation).toBeCloseTo(15272.73, 2);
        });

        it('should throw error for invalid inputs', () => {
            expect(() => {
                calculateDepreciation({
                    purchasePrice: 0,
                    purchaseDate: new Date('2024-01-01'),
                    assessedLandValue: 100000,
                    assessedBuildingValue: 400000,
                });
            }).toThrow('Purchase price must be greater than zero');

            expect(() => {
                calculateDepreciation({
                    purchasePrice: 500000,
                    purchaseDate: new Date('2024-01-01'),
                    assessedLandValue: 100000,
                    assessedBuildingValue: 0,
                });
            }).toThrow('Assessed building value must be greater than zero');
        });
    });

    describe('generateDepreciationSchedule', () => {
        it('should generate 28-year schedule', () => {
            const schedule = generateDepreciationSchedule({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            expect(schedule.length).toBeGreaterThan(27);
            expect(schedule.length).toBeLessThanOrEqual(29);
        });

        it('should have correct first year depreciation', () => {
            const schedule = generateDepreciationSchedule({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            const firstYear = schedule[0];
            expect(firstYear.year).toBe(1);
            expect(firstYear.taxYear).toBe(2024);
            expect(firstYear.depreciation).toBeCloseTo(13940.91, 2);
        });

        it('should have consistent annual depreciation for middle years', () => {
            const schedule = generateDepreciationSchedule({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            // Years 2-27 should have same annual depreciation
            for (let i = 1; i < schedule.length - 1; i++) {
                expect(schedule[i].depreciation).toBeCloseTo(14545.45, 2);
            }
        });

        it('should accumulate correctly', () => {
            const schedule = generateDepreciationSchedule({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            let accumulated = 0;
            schedule.forEach(entry => {
                accumulated += entry.depreciation;
                expect(entry.accumulatedDepreciation).toBeCloseTo(accumulated, 2);
            });
        });

        it('should fully depreciate by end of schedule', () => {
            const schedule = generateDepreciationSchedule({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            const lastEntry = schedule[schedule.length - 1];
            expect(lastEntry.accumulatedDepreciation).toBeCloseTo(400000, 2);
            expect(lastEntry.remainingValue).toBeCloseTo(0, 2);
        });
    });

    describe('getCurrentYearDepreciation', () => {
        it('should return correct amount for first year', () => {
            const amount = getCurrentYearDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            }, 2024);

            expect(amount).toBeCloseTo(13940.91, 2);
        });

        it('should return correct amount for middle years', () => {
            const amount = getCurrentYearDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            }, 2025);

            expect(amount).toBeCloseTo(14545.45, 2);
        });

        it('should return 0 for years before purchase', () => {
            const amount = getCurrentYearDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            }, 2023);

            expect(amount).toBe(0);
        });
    });

    describe('getAccumulatedDepreciation', () => {
        it('should return correct accumulated amount', () => {
            const accumulated = getAccumulatedDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-01-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            }, 2025);

            // First year (11.5 months) + second year (full)
            const expected = 13940.91 + 14545.45;
            expect(accumulated).toBeCloseTo(expected, 2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle December purchase (0.5 months first year)', () => {
            const result = calculateDepreciation({
                purchasePrice: 500000,
                purchaseDate: new Date('2024-12-15'),
                assessedLandValue: 100000,
                assessedBuildingValue: 400000,
            });

            expect(result.monthsInFirstYear).toBeCloseTo(0.5, 1);
            expect(result.firstYearDepreciation).toBeCloseTo(606.06, 2);
        });

        it('should handle very high land ratio', () => {
            // 90% land, 10% building
            const result = calculateDepreciation({
                purchasePrice: 1000000,
                purchaseDate: new Date('2024-01-01'),
                assessedLandValue: 900000,
                assessedBuildingValue: 100000,
            });

            expect(result.landValue).toBe(900000);
            expect(result.buildingValue).toBe(100000);
            expect(result.depreciableValue).toBe(100000);
        });

        it('should round correctly to cents', () => {
            const result = calculateDepreciation({
                purchasePrice: 333333,
                purchaseDate: new Date('2024-01-01'),
                assessedLandValue: 66666,
                assessedBuildingValue: 266667,
            });

            // All values should be rounded to 2 decimal places
            expect(result.landValue % 1).toBeLessThan(0.01);
            expect(result.buildingValue % 1).toBeLessThan(0.01);
            expect(result.annualDepreciation % 1).toBeLessThan(0.01);
        });
    });
});
