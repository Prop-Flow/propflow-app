import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pendingTenantSchema } from '@/lib/schemas/api-responses';
import { z } from 'zod';

export async function GET() {
    try {
        const tenants = await prisma.tenant.findMany({
            where: {
                status: 'pending',
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Validate response data
        const validatedTenants = z.array(pendingTenantSchema).parse(tenants);

        return NextResponse.json(validatedTenants);
    } catch (error) {
        console.error('Error fetching pending tenants:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data format', details: error.errors },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch pending tenants' },
            { status: 500 }
        );
    }
}
