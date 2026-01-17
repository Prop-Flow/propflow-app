/**
 * Demo Reset Activation API Route
 * 
 * POST /api/demo/reset-activation
 * Sets demoActivated=false for the MVP demo user.
 * Only works when demo mode is enabled and user is allowlisted.
 * Used to reset demo to empty state before recording.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { isMVPDemoUser } from '@/lib/config/demo';

// Initialize Firebase Admin (if not already initialized)
import '@/lib/services/firebase-admin';

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

        // Get user from auth token
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decodedToken = await getAuth().verifyIdToken(token);
        const userEmail = decodedToken.email;

        // Verify user is MVP demo
        if (!isMVPDemoUser(userEmail)) {
            return NextResponse.json(
                { error: 'Not authorized for demo reset' },
                { status: 403 }
            );
        }

        // Set demoActivated = false
        const db = getFirestore();
        const userRef = db.collection('users').doc(decodedToken.uid);

        await userRef.update({
            demoActivated: false,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Demo reset to empty state successfully',
        });
    } catch (error) {
        console.error('Error resetting demo activation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
