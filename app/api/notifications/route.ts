import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { verifyAuth } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
    try {
        const decodedToken = await verifyAuth(req);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = decodedToken.uid;

        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyAuth(req);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = decodedToken.uid;

        const body = await req.json();
        const { title, message, type, link } = body;

        const notificationRef = db.collection('notifications').doc();
        const notification = {
            id: notificationRef.id,
            userId: userId,
            title,
            message,
            type: type || 'info',
            link: link || null,
            createdAt: new Date(),
            read: false
        };

        await notificationRef.set(notification);

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
