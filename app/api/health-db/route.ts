import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Connect and get property count as a known collection check
        const snapshot = await db.collection('properties').count().get();
        const propertyCount = snapshot.data().count;

        return NextResponse.json({
            status: 'healthy',
            database: {
                connected: true,
                propertyCount: propertyCount,
                provider: 'firestore'
            },
            environment: process.env.NODE_ENV
        });
    } catch (error: unknown) {
        console.error('Database health check failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        return NextResponse.json({
            status: 'unhealthy',
            database: {
                connected: false,
                error: errorMessage
            }
        }, { status: 500 });
    }
}
