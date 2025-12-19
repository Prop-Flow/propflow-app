
const MONTHS = [
    "July 2023", "August 2023", "September 2023", "October 2023", "November 2023", "December 2023",
    "January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024",
    "July 2024", "August 2024", "September 2024", "October 2024", "November 2024", "December 2024"
];

const PROPERTY_NAMES = [
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

interface MonthlyUsage {
    month: string;
    usage: number;
}

interface Property {
    property_id: string;
    property_name: string;
    utility_type: string;
    unit: string;
    has_anomaly: boolean;
    anomaly_severity: 'low' | 'medium' | 'high' | null;
    anomaly_description: string;
    monthly_usage: MonthlyUsage[];
}

function generateData() {
    const properties: Property[] = [];
    let anomalyCount = 0;

    // Force 3 anomalies for a 30% rate (closest to 25% for 10)
    const anomalyIndices = new Set<number>();
    while (anomalyIndices.size < 3) {
        anomalyIndices.add(Math.floor(Math.random() * 10));
    }

    const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    PROPERTY_NAMES.forEach((name, index) => {
        const id = `PROP-00${index + 1}`;
        const hasAnomaly = anomalyIndices.has(index);
        const severity = hasAnomaly ? severities[anomalyCount % 3] : null;
        if (hasAnomaly) anomalyCount++;

        const monthlyUsage: MonthlyUsage[] = [];
        const baseMonthlyUsage = 5000; // Middle of 4500-5500

        MONTHS.forEach((month, mIdx) => {
            // Seasonal variation: +10% in summer (July, Aug), -5% in winter (Dec, Jan)
            let factor = 1.0;
            if (month.includes("July") || month.includes("August")) factor = 1.1;
            if (month.includes("December") || month.includes("January")) factor = 0.95;

            let usage = (baseMonthlyUsage * factor) + (Math.random() * 600 - 300); // ±300 variation

            // Apply anomaly in final months (1-3 months)
            if (hasAnomaly && mIdx >= (MONTHS.length - 3)) {
                // Let's say anomaly starts in Oct, Nov, or Dec
                // For simplicity, we'll spike the last 1-2 months
                const anomalyStarts = MONTHS.length - (1 + Math.floor(Math.random() * 2));
                if (mIdx >= anomalyStarts) {
                    if (severity === 'low') usage = (baseMonthlyUsage * 1.55) + (Math.random() * 200);
                    if (severity === 'medium') usage = (baseMonthlyUsage * 2.55) + (Math.random() * 300);
                    if (severity === 'high') usage = (baseMonthlyUsage * 3.65) + (Math.random() * 500);
                }
            }

            monthlyUsage.push({
                month,
                usage: Math.round(usage)
            });
        });

        let description = "No anomaly detected";
        if (hasAnomaly) {
            const lastMonth = MONTHS[MONTHS.length - 1];
            if (severity === 'high') description = `Major leak detected - 3.6x+ usage spike in ${lastMonth}`;
            else if (severity === 'medium') description = `Running toilet detected - 2.5x+ usage spike in ${lastMonth}`;
            else description = `Small leak detected - 1.5x usage spike in ${lastMonth}`;
        }

        properties.push({
            property_id: id,
            property_name: name,
            utility_type: "water",
            unit: "gallons",
            has_anomaly: hasAnomaly,
            anomaly_severity: severity,
            anomaly_description: description,
            monthly_usage: monthlyUsage
        });
    });

    const result = {
        generated_timestamp: new Date().toISOString().split('T')[0],
        dataset_id: "DEMO-BATCH-001",
        properties: properties,
        summary: {
            total_properties: 10,
            properties_with_anomalies: anomalyCount,
            anomaly_percentage: (anomalyCount / 10) * 100
        }
    };

    console.log(JSON.stringify(result, null, 2));
}

generateData();
