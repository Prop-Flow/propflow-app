/**
 * Demo Seed API Route
 * 
 * POST /api/demo/seed
 * Triggers seeding of demo data into Firestore.
 * Only works when demo mode is enabled.
 */

import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/services/demo-seed';

export async function POST(request: NextRequest) {
    try {
        // Check if demo mode is enabled via environment variable
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

        if (!isDemoMode) {
            return NextResponse.json(
                { error: 'Demo mode is not enabled' },
                { status: 403 }
            );
        }

        // Seed the demo data
        const result = await seedDemoData();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } else {
            return NextResponse.json(
                { error: result.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in demo seed API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
