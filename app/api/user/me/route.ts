import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { verifyAuth } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Migration: Client should request this via Firestore directly, or pass userId
        // Verify authentication
        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = decodedToken.uid;

        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return new NextResponse('User not found', { status: 404 });
        }

        return NextResponse.json({
            id: userDoc.id,
            ...userDoc.data()
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
