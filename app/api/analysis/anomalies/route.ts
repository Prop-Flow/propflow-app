import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeProperties, PropertyData, MonthlyUsage } from '@/lib/ai/anomaly-detection';

export async function GET() {
    try {
        // Fetch real properties from DB
        const properties = await prisma.property.findMany({
            select: { id: true, name: true }
        });

        if (properties.length === 0) {
            return NextResponse.json({
                total_properties: 0,
                anomalies_detected: 0,
                anomaly_rate: 0,
                results: []
            });
        }

        // Generate synthetic history for real properties so the AI has data to work with
        // In a real app, this would come from UtilityBill entries
        const dataset: PropertyData[] = properties.map(p => {
            const history: MonthlyUsage[] = [];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

            // Base usage around 5000 gallons/units
            const baseUsage = 4000 + Math.random() * 2000;

            months.forEach(month => {
                history.push({
                    month,
                    usage: Math.round(baseUsage + (Math.random() * 1000 - 500))
                });
            });

            return {
                property_id: p.id, // REAL ID
                property_name: p.name,
                usage_history: history
            };
        });

        const analysis = analyzeProperties(dataset);

        return NextResponse.json(analysis);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in anomaly analysis API:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: message
        }, { status: 500 });
    }
}
