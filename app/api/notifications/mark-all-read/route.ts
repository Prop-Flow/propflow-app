import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true, updatedAt: new Date() });
        });

        await batch.commit();

        return NextResponse.json({ success: true, count: snapshot.size });
    } catch (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
