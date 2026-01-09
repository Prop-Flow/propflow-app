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
 * @deprecated Use verifyAuth instead for API routes. 
 * This is kept for compatibility during migration but returns null.
 */
export async function getSession(request: NextRequest): Promise<{ user: SessionUser } | null> {
    console.warn('Called deprecated getSession.');
    return null;
}

export async function getSessionUser(request: NextRequest): Promise<SessionUser> {
    throw new Error('Authentication migration in progress: Server-side component not supported yet.');
}
