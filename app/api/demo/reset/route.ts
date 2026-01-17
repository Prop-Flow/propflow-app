/**
 * Demo Reset API Route
 * 
 * POST /api/demo/reset
 * Clears all demo data from Firestore.
 * Only works when demo mode is enabled.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearDemoData } from '@/lib/services/demo-seed';

export async function POST(request: NextRequest) {
    try {
        // Check if demo mode is enabled
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

        if (!isDemoMode) {
            return NextResponse.json(
                { error: 'Demo mode is not enabled' },
                { status: 403 }
            );
        }

        // Clear the demo data
        const result = await clearDemoData();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
            });
        } else {
            return NextResponse.json(
                { error: result.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in demo reset API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
