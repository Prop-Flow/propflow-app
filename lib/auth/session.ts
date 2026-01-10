import { NextRequest } from 'next/server';
import { auth } from '@/lib/services/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface SessionUser {
    id: string;
    email: string;
    role: 'owner' | 'tenant' | 'property_manager';
    firstName?: string;
    lastName?: string;
}

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Returns the decoded token if valid, or null if invalid/missing.
 */
export async function verifyAuth(request: Request | NextRequest): Promise<DecodedIdToken | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return null;
    }
}

/**
 * Retrieves the session user by verifying the token and fetching their Firestore profile.
 * Used in API routes to get full user context.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser> {
    const decodedToken = await verifyAuth(request);
    if (!decodedToken) {
        throw new Error('Unauthorized: Invalid or missing token');
    }

    try {
        const { db } = await import('@/lib/services/firebase-admin');
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            console.error(`[Auth] User profile not found for UID: ${decodedToken.uid}`);
            // Fallback for dev mode or new users if necessary, but typically we want a profile
            return {
                id: decodedToken.uid,
                email: decodedToken.email || '',
                role: 'owner', // Default fallback
            };
        }

        const userData = userDoc.data();
        return {
            id: decodedToken.uid,
            email: decodedToken.email || userData?.email || '',
            role: userData?.role || 'owner',
            firstName: userData?.firstName,
            lastName: userData?.lastName,
        };
    } catch (error) {
        console.error('[Auth] Error fetching session user:', error);
        throw new Error('Internal Server Error: Failed to retrieve user session');
    }
}
