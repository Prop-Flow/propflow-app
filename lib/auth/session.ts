/**
 * Session Management
 * Server-side session validation for API routes using Auth.js
 */

import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '../errors/custom-errors';

export interface SessionUser {
    id: string;
    email: string;
    role: 'owner' | 'tenant' | 'property_manager';
    firstName?: string;
    lastName?: string;
}

/**
 * Get session from request
 * Uses Auth.js server-side session retrieval
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSession(_request: NextRequest): Promise<{ user: SessionUser } | null> {
    const session = await auth();

    if (!session?.user) return null;

    // Transform Auth.js session user to our internal SessionUser type
    // We assume the database has the correct role, or we fetch it if needed.
    // For now, simpler is better: cast and return.
    return {
        user: {
            id: session.user.id || '',
            email: session.user.email || '',
            // Default to tenant if role is missing in safe session types
            // In production, we'd ensure role is in the session callback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: (session.user as any).role || 'tenant',
            firstName: session.user.name?.split(' ')[0],
            lastName: session.user.name?.split(' ').slice(1).join(' ')
        } as SessionUser
    };
}

/**
 * Get authenticated user from request
 * Throws UnauthorizedError if not authenticated
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser> {
    const session = await getSession(request);

    if (!session?.user) {
        throw new UnauthorizedError('Authentication required');
    }

    return session.user;
}

/**
 * Verify user has required role
 */
export function requireRole(user: SessionUser, allowedRoles: string[]): void {
    if (!allowedRoles.includes(user.role)) {
        throw new UnauthorizedError(`Role ${user.role} not authorized for this action`);
    }
}

/**
 * Check if user is owner or manager
 */
export function isOwnerOrManager(user: SessionUser): boolean {
    return user.role === 'owner' || user.role === 'property_manager';
}

/**
 * Check if user is tenant
 */
export function isTenant(user: SessionUser): boolean {
    return user.role === 'tenant';
}
