
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration
const BASELINE_MONTHS_COUNT = 15;
const COST_PER_GALLON = 0.005;
const STD_DEV_MULTIPLIER = 3;

export interface MonthlyUsage {
    month: string;
    usage: number;
    exceeds_threshold?: boolean;
}

export interface PropertyData {
    property_id: string;
    property_name: string;
    usage_history: MonthlyUsage[];
}

export interface DetectionResult {
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

export interface AnalysisResult {
    analysis_timestamp: string;
    analysis_id: string;
    detection_results: DetectionResult[];
    summary: {
        total_properties_analyzed: number;
        properties_with_anomalies: number;
        anomaly_detection_rate: number;
        total_cost_impact: number;
    };
}

/**
 * Perform anomaly detection logic
 */
export function analyzeProperties(dataset: PropertyData[]): AnalysisResult {
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

// Support running directly with ts-node
const isDirectRun = process.argv[1] && (
    process.argv[1].endsWith('anomaly-detection.ts') ||
    process.argv[1].includes('ts-node')
);

if (isDirectRun) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const dataPath = path.join(__dirname, 'demo-dataset.json');

    if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const demoData = JSON.parse(rawData);
        const dataset: PropertyData[] = demoData.properties.map((p: { property_id: string; property_name: string; monthly_usage: MonthlyUsage[] }) => ({
            property_id: p.property_id,
            property_name: p.property_name,
            usage_history: p.monthly_usage
        }));

        const finalResults = analyzeProperties(dataset);
        console.log(JSON.stringify(finalResults, null, 2));
    }
}
