import { NextRequest, NextResponse } from 'next/server';
import { approveOptimization, rejectOptimization } from '@/lib/financials/lease-optimizer';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ optimizationId: string }> }
) {
    try {
        const { optimizationId } = await params;
        const body = await request.json();
        const { action, reviewedBy } = body;

        if (!action || !reviewedBy) {
            return NextResponse.json(
                { error: 'Missing required fields: action, reviewedBy' },
                { status: 400 }
            );
        }

        let result;
        if (action === 'approve') {
            result = await approveOptimization(optimizationId, reviewedBy);
        } else if (action === 'reject') {
            result = await rejectOptimization(optimizationId, reviewedBy);
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error processing optimization approval:', error);
        return NextResponse.json(
            { error: 'Failed to process optimization' },
            { status: 500 }
        );
    }
}
