import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        const notificationRef = db.collection('notifications').doc(id);
        await notificationRef.update({ read: true, updatedAt: new Date() });

        return NextResponse.json({ id, success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
