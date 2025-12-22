import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find tenant by email -> get property -> get managers
        const tenant = await prisma.tenant.findFirst({
            where: { email },
            include: {
                property: {
                    include: {
                        managers: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const managers = (tenant as any).property.managers;

        return NextResponse.json({
            managers,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            propertyName: (tenant as any).property.name
        });
    } catch (error) {
        console.error('Failed to fetch tenant manager:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
