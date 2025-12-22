import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // In a real app, verify Owner session.
        // Fetch all users with role PROPERTY_MANAGER.
        // Ideally filter by those assigned to Owner's properties.

        const managers = await prisma.user.findMany({
            where: {
                role: 'PROPERTY_MANAGER'
            },
            include: {
                managedProperties: {
                    select: { id: true, name: true }
                }
            }
        });

        return NextResponse.json({ managers });
    } catch (error) {
        console.error('Failed to fetch managers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
