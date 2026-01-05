import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const propertyCount = await prisma.property.count();
        const tenantCount = await prisma.tenant.count();

        // Mocking values for now since logic was removed
        const requestCount = Math.floor(tenantCount / 3);
        const messageCount = 0;

        return NextResponse.json({
            properties: propertyCount,
            requests: requestCount,
            inquiries: tenantCount,
            messages: messageCount
        });
    } catch (error) {
        console.error("Failed to fetch manager stats", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
