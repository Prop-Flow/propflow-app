import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/services/firebase-admin';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            logger.api('No user ID in session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.api(`Fetching user profile for ID: ${session.user.id}`);

        // Lookup user by ID from session
        const userDoc = await db.collection('users').doc(session.user.id).get();

        if (!userDoc.exists) {
            logger.error(`User not found for session ID: ${session.user.id}`);

            // Production: minimal error info
            if (logger.isProduction) {
                return NextResponse.json({
                    error: 'User not found'
                }, { status: 404 });
            }

            // Development: detailed debug info
            return NextResponse.json({
                error: 'User not found',
                debug: {
                    requestedId: session.user.id,
                    requestedEmail: session.user.email,
                }
            }, { status: 404 });
        }

        const userData = userDoc.data();
        const user = {
            id: userDoc.id,
            email: userData?.email,
            name: userData?.name,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            role: userData?.role,
            phone: userData?.phone,
        };

        return NextResponse.json(user);
    } catch (error) {
        logger.error('Error fetching user', error);

        // Production: generic error
        if (logger.isProduction) {
            return NextResponse.json({
                error: 'Internal server error'
            }, { status: 500 });
        }

        // Development: detailed error
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
