
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
    utility_type: 'Water' | 'Electric' | 'Gas';
    anomaly_detected: boolean;
    baseline_average: number;
    baseline_std_dev: number;
    anomaly_threshold: number;
    recent_months: (MonthlyUsage & { exceeds_threshold: boolean })[];
    severity: 'low' | 'medium' | 'high' | null;
    cost_impact_monthly: number;
    alert_message: string;
    rubs_link?: string;
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
    const results: DetectionResult[] = [];

    dataset.forEach(property => {
        // Simulate multiple utility types for each property
        const utilityTypes: ('Water' | 'Electric' | 'Gas')[] = ['Water', 'Electric', 'Gas'];

        utilityTypes.forEach(type => {
            // Clone and slightly randomize usage history to simulate different utilities
            // In a real app, this data would come from the database per utility meter
            const varianceFactor = type === 'Electric' ? 1.5 : type === 'Gas' ? 0.8 : 1.0;
            const costPerUnit = type === 'Electric' ? 0.15 : type === 'Gas' ? 1.2 : COST_PER_GALLON;

            const usageHistory = property.usage_history.map(m => ({
                ...m,
                usage: Math.round(m.usage * varianceFactor * (0.9 + Math.random() * 0.2))
            }));

            const baselineData = usageHistory.slice(0, BASELINE_MONTHS_COUNT);
            const recentData = usageHistory.slice(BASELINE_MONTHS_COUNT);

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
            let alertMessage = `No ${type.toLowerCase()} anomaly detected. Usage remains within normal range.`;

            if (anomaly_detected && highestAnomalyMonth) {
                const currentHighest: MonthlyUsage = highestAnomalyMonth;
                const ratio = currentHighest.usage / (average || 1);

                if (ratio >= 2.8) severity = 'high';
                else if (ratio >= 1.8) severity = 'medium';
                else if (ratio >= 1.4) severity = 'low';

                costImpact = (currentHighest.usage - average) * costPerUnit;

                const unit = type === 'Water' ? 'gal' : type === 'Electric' ? 'kWh' : 'therms';
                alertMessage = `${type} anomaly detected. Usage hit ${currentHighest.usage.toLocaleString()} ${unit} (avg ${Math.round(average).toLocaleString()}). +$${costImpact.toFixed(2)} impact.`;
            }

            const rubsLink = anomaly_detected ? `/billing?propertyId=${property.property_id}` : undefined;

            results.push({
                property_id: property.property_id,
                property_name: property.property_name,
                utility_type: type,
                anomaly_detected,
                baseline_average: Math.round(average),
                baseline_std_dev: Math.round(stdDev),
                anomaly_threshold: Math.round(threshold),
                recent_months: analyzedRecentMonths,
                severity,
                cost_impact_monthly: parseFloat(costImpact.toFixed(2)),
                alert_message: alertMessage,
                rubs_link: rubsLink
            });
        });
    });

    const totalImpact = results.reduce((sum, r) => sum + r.cost_impact_monthly, 0);
    // Count properties with at least one anomaly
    const propertiesWithAnomalies = new Set(results.filter(r => r.anomaly_detected).map(r => r.property_id)).size;

    return {
        analysis_timestamp: new Date().toISOString().split('T')[0],
        analysis_id: "ANALYSIS-BATCH-001",
        detection_results: results,
        summary: {
            total_properties_analyzed: dataset.length,
            properties_with_anomalies: propertiesWithAnomalies,
            anomaly_detection_rate: (propertiesWithAnomalies / dataset.length) * 100,
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
