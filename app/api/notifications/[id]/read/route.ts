import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { verifyAuth } from '@/lib/auth/session';

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const decodedToken = await verifyAuth(req);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = decodedToken.uid;

        const params = await props.params;
        const { id } = params;

        const notificationRef = db.collection('notifications').doc(id);
        const doc = await notificationRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        if (doc.data()?.userId !== userId) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        await notificationRef.update({ read: true, updatedAt: new Date() });

        return NextResponse.json({ id, success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
