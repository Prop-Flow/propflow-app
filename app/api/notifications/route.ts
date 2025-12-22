import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth'; // Pending real auth integration

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Mock auth for now - in real app, get userId from session
        // const userId = session?.user?.id; 
        const userId = searchParams.get('userId'); // Temp: pass via query for dev

        if (!userId) {
            // Fallback for dev/demo if no user passed, just fetch recent 10 for first user found or return empty
            return NextResponse.json([]);
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, title, message, type, link } = body;

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || 'info',
                link,
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
