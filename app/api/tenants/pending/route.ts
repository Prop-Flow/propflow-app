import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';

const pendingTenantSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    status: z.string(),
    createdAt: z.date(),
    property: z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
    }),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        const tenants = await prisma.tenant.findMany({
            where: {
                status: 'pending',
                property: {
                    ownerUserId: user.id
                }
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
