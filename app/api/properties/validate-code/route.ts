import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Building code is required' }, { status: 400 });
        }

        const property = await prisma.property.findUnique({
            where: { buildingCode: code },
            select: {
                id: true,
                name: true,
                address: true,
            },
        });

        if (!property) {
            return NextResponse.json({ error: 'Invalid building code' }, { status: 404 });
        }

        return NextResponse.json({ property });
    } catch (error) {
        console.error('Error validating building code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
