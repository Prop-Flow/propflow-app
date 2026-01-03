import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Connect and get current database time
        const dbTime = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;

        // 2. Count properties as a known table check
        const propertyCount = await prisma.property.count();

        return NextResponse.json({
            status: 'healthy',
            database: {
                connected: true,
                time: dbTime[0].now,
                propertyCount: propertyCount,
                pooler: process.env.DATABASE_URL?.includes('-pooler') ? 'enabled' : 'disabled'
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
