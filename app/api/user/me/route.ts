import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            logger.api('No user ID in session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.api(`Fetching user profile for ID: ${session.user.id}`);

        // Handle anonymous Developer Mode
        if (session.user.id === 'dev-mode-user') {
            return NextResponse.json({
                id: 'dev-mode-user',
                email: 'dev@propflow.ai',
                firstName: 'Developer',
                lastName: '(Mode)',
                name: 'Developer Mode',
                role: 'OWNER',
            });
        }

        // Lookup user by ID from session
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
            },
        });

        if (!user) {
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
                    sessionKeys: Object.keys(session.user)
                }
            }, { status: 404 });
        }

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
