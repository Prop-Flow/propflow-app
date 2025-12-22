import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // In a real app, filtering by the logged-in manager is required.
        // For now, we return global stats or mock focused stats.

        const propertyCount = await prisma.property.count();
        const tenantCount = await prisma.tenant.count();
        const messageCount = await prisma.communicationLog.count();

        // Mocking "Active Requests" as 1/3 of tenants for demo purposes
        const requestCount = Math.floor(tenantCount / 3);

        return NextResponse.json({
            properties: propertyCount,
            requests: requestCount,
            inquiries: tenantCount, // Using tenant count as a proxy for inquiries for now
            messages: messageCount
        });
    } catch (error) {
        console.error("Failed to fetch manager stats", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
