

interface MonthlyUsage {
    month: string;
    usage: number;
    exceeds_threshold?: boolean;
}

interface PropertyData {
    property_id: string;
    property_name: string;
    usage_history: MonthlyUsage[];
}

interface DetectionResult {
    property_id: string;
    property_name: string;
    anomaly_detected: boolean;
    baseline_average: number;
    baseline_std_dev: number;
    anomaly_threshold: number;
    recent_months: (MonthlyUsage & { exceeds_threshold: boolean })[];
    severity: 'low' | 'medium' | 'high' | null;
    cost_impact_monthly: number;
    alert_message: string;
}

// Configuration
const BASELINE_MONTHS_COUNT = 15;
const RECENT_MONTHS_COUNT = 3;
const COST_PER_GALLON = 0.005;
const STD_DEV_MULTIPLIER = 3;

const MONTH_NAMES = [
    "July 2023", "August 2023", "September 2023", "October 2023", "November 2023", "December 2023",
    "January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024",
    "July 2024", "August 2024", "September 2024", "October 2024", "November 2024", "December 2024"
];

/**
 * Generate synthetic utility dataset for 10 properties
 */
function generateSyntheticDataset(): PropertyData[] {
    const propertyNames = [
        "123 Main Street Apartments",
        "456 Oak Boulevard Townhomes",
        "789 Pine Residence",
        "101 Cedar Village",
        "202 Maple Courts",
        "303 Birch Plaza",
        "404 Willow Heights",
        "505 Elm Square",
        "606 Spruce Gardens",
        "707 Aspen Lofts"
    ];

    return propertyNames.map((name, index) => {
        const baselineAvg = 5000 + (Math.random() * 1000); // Between 5000-6000
        const stdDev = 200 + (Math.random() * 100); // Normal variation 200-300

        const usageHistory: MonthlyUsage[] = MONTH_NAMES.map((month, mIdx) => {
            let usage = baselineAvg + (Math.random() * 2 - 1) * stdDev;

            // Introduce anomalies in recent months for some properties
            if (mIdx >= BASELINE_MONTHS_COUNT) {
                if (index === 1 && mIdx === 17) { // PROP-002 December
                    usage = baselineAvg * 3.3; // HIGH anomaly
                } else if (index === 4 && mIdx === 16) { // PROP-005 November
                    usage = baselineAvg * 2.2; // MEDIUM anomaly
                } else if (index === 7 && mIdx === 17) { // PROP-008 December
                    usage = baselineAvg * 1.5; // LOW anomaly
                }
            }

            return { month, usage: Math.round(usage) };
        });

        return {
            property_id: `PROP-00${index + 1}`,
            property_name: name,
            usage_history: usageHistory
        };
    });
}

/**
 * Perform anomaly detection logic
 */
function analyzeProperties(dataset: PropertyData[]): any {
    const results: DetectionResult[] = dataset.map(property => {
        const baselineData = property.usage_history.slice(0, BASELINE_MONTHS_COUNT);
        const recentData = property.usage_history.slice(BASELINE_MONTHS_COUNT);

        const baselineUsages = baselineData.map(d => d.usage);
        const average = baselineUsages.reduce((a, b) => a + b, 0) / BASELINE_MONTHS_COUNT;

        const variance = baselineUsages.reduce((a, b) => a + Math.pow(b - average, 2), 0) / BASELINE_MONTHS_COUNT;
        const stdDev = Math.sqrt(variance);

        const threshold = average + (STD_DEV_MULTIPLIER * stdDev);

        let anomaly_detected = false;
        let highestAnomalyMonth: MonthlyUsage | null = null;

        const analyzedRecentMonths = recentData.map(m => {
            const exceeds = m.usage > threshold;
            if (exceeds) {
                anomaly_detected = true;
                if (!highestAnomalyMonth || m.usage > highestAnomalyMonth.usage) {
                    highestAnomalyMonth = m;
                }
            }
            return { ...m, exceeds_threshold: exceeds } as MonthlyUsage & { exceeds_threshold: boolean };
        });

        let severity: 'low' | 'medium' | 'high' | null = null;
        let costImpact = 0;
        let alertMessage = "No anomaly detected. Usage remains within normal range.";

        if (anomaly_detected && highestAnomalyMonth) {
            const currentHighest: MonthlyUsage = highestAnomalyMonth;
            const ratio = currentHighest.usage / average;
            const increasePercent = Math.round((ratio - 1) * 100);

            if (ratio >= 2.8) {
                severity = 'high';
            } else if (ratio >= 1.8) {
                severity = 'medium';
            } else if (ratio >= 1.4) {
                severity = 'low';
            }

            costImpact = (currentHighest.usage - average) * COST_PER_GALLON;

            const cause = severity === 'high' ? "Major leak or burst pipe" :
                severity === 'medium' ? "Running toilet or significant leak" :
                    "Small leak or dripping faucet";

            alertMessage = `${cause} detected. Water usage increased ${increasePercent}% in ${currentHighest.month} (${currentHighest.usage.toLocaleString()} gal vs. normal ${Math.round(average).toLocaleString()} gal). Estimated monthly cost impact: $${costImpact.toFixed(2)}. ${severity === 'high' ? 'Immediate investigation recommended.' : 'Investigation recommended.'}`;
        }

        return {
            property_id: property.property_id,
            property_name: property.property_name,
            anomaly_detected,
            baseline_average: Math.round(average),
            baseline_std_dev: Math.round(stdDev),
            anomaly_threshold: Math.round(threshold),
            recent_months: analyzedRecentMonths,
            severity,
            cost_impact_monthly: parseFloat(costImpact.toFixed(2)),
            alert_message: alertMessage
        };
    });

    const totalImpact = results.reduce((sum, r) => sum + r.cost_impact_monthly, 0);
    const anomaliesCount = results.filter(r => r.anomaly_detected).length;

    return {
        analysis_timestamp: new Date().toISOString().split('T')[0],
        analysis_id: "ANALYSIS-BATCH-001",
        detection_results: results,
        summary: {
            total_properties_analyzed: results.length,
            properties_with_anomalies: anomaliesCount,
            anomaly_detection_rate: (anomaliesCount / results.length) * 100,
            total_cost_impact: parseFloat(totalImpact.toFixed(2))
        }
    };
}


// Run the analysis
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runAnalysis() {
    const dataPath = path.join(__dirname, 'demo-dataset.json');
    if (!fs.existsSync(dataPath)) {
        console.error("Dataset not found. Generate it first using generate-demo-data.ts");
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const demoData = JSON.parse(rawData);

    // Map demo data format to PropertyData format
    const dataset: PropertyData[] = demoData.properties.map((p: any) => ({
        property_id: p.property_id,
        property_name: p.property_name,
        usage_history: p.monthly_usage
    }));

    const finalResults = analyzeProperties(dataset);
    console.log(JSON.stringify(finalResults, null, 2));
}

runAnalysis();
