import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        version: 'verification-check-001',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        project: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
    });
}
