
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeProperties, PropertyData } from '@/lib/ai/anomaly-detection';

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), 'lib/ai/demo-dataset.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({
                error: 'Dataset not found',
                message: 'Demo dataset has not been generated yet.'
            }, { status: 404 });
        }

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const demoData = JSON.parse(rawData);

        // Map demo data format to PropertyData format
        const dataset: PropertyData[] = demoData.properties.map((p: { property_id: string; property_name: string; monthly_usage: { month: string; usage: number }[] }) => ({
            property_id: p.property_id,
            property_name: p.property_name,
            usage_history: p.monthly_usage
        }));

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
