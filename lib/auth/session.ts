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
export async function getSession(request: NextRequest): Promise<{ user: SessionUser } | null> {
    const session = await auth();

    // 1. If we have a real authenticated session, use it!
    if (session?.user) {
        return {
            user: {
                id: session.user.id || '',
                email: session.user.email || '',
                // Default to tenant if role is missing in safe session types
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                role: (session.user as any).role || 'tenant',
                firstName: session.user.name?.split(' ')[0],
                lastName: session.user.name?.split(' ').slice(1).join(' ')
            } as SessionUser
        };
    }

    // 2. Check for Developer Mode bypass (Cookie-based) only if no real session
    const devMode = process.env.NODE_ENV === 'development' && request.cookies.get('propflow_dev_mode')?.value === 'true';
    if (devMode) {
        const devRole = request.cookies.get('propflow_dev_role')?.value || 'owner';
        return {
            user: {
                id: 'dev-user-id',
                email: 'dev@propflow.ai',
                role: (devRole === 'manager' ? 'property_manager' : devRole) as SessionUser['role'],
                firstName: 'Developer',
                lastName: '(Mode)'
            }
        };
    }

    return null;
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
