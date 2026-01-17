/**
 * Demo Activation API Route
 * 
 * POST /api/demo/activate
 * Seeds demo data if missing, then sets demoActivated=true for the MVP demo user.
 * Only works when demo mode is enabled and user is allowlisted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { isMVPDemoUser } from '@/lib/config/demo';
import { seedDemoData } from '@/lib/services/demo-seed';

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
                { error: 'Not authorized for demo activation' },
                { status: 403 }
            );
        }

        const db = getFirestore();
        const userRef = db.collection('users').doc(decodedToken.uid);

        // Check if demo data needs to be seeded
        let seeded = false;
        try {
            // Check if properties exist for this user
            const propertiesSnapshot = await db.collection('users')
                .doc(decodedToken.uid)
                .collection('properties')
                .limit(1)
                .get();

            if (propertiesSnapshot.empty) {
                // No properties exist - seed demo data
                console.log('[Demo Activate] Seeding demo data for user:', decodedToken.uid);
                const seedResult = await seedDemoData();

                if (!seedResult.success) {
                    throw new Error(seedResult.message);
                }

                seeded = true;
                console.log('[Demo Activate] Seeded:', seedResult.data);
            } else {
                console.log('[Demo Activate] Demo data already exists, skipping seed');
            }
        } catch (seedError) {
            console.error('[Demo Activate] Error during seeding:', seedError);
            // Continue with activation even if seeding fails
            // (data might already exist from a previous seed)
        }

        // Set demoActivated = true
        await userRef.update({
            demoActivated: true,
            demoProfile: 'mvp_demo',
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Demo activated successfully',
            seeded,
        });
    } catch (error) {
        console.error('Error activating demo:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
