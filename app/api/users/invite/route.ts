import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inviteManagerSchema } from '@/lib/validations/auth';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);
        const body = await req.json();

        // Zod Validation
        const result = inviteManagerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, propertyId } = result.data;

        // SECURITY CHECK: Verify if the session user owns the property they are inviting a manager to
        if (propertyId) {
            const property = await prisma.property.findUnique({
                where: { id: propertyId },
                select: { ownerUserId: true }
            });

            if (!property || property.ownerUserId !== user.id) {
                return NextResponse.json({ error: 'You do not have permission to invite managers to this property' }, { status: 403 });
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // If user exists and propertyId is provided, grant them access immediately
            if (propertyId) {
                await prisma.property.update({
                    where: { id: propertyId },
                    data: {
                        managers: {
                            connect: { id: existingUser.id }
                        }
                    }
                });
                return NextResponse.json({ success: true, message: 'Existing user added as manager to property.' });
            }

            return NextResponse.json({ message: 'User already exists in the system.' });
        }

        // Invitations are temporarily disabled in the database
        // We will just log the "invitation" to the console for now
        const token = crypto.randomBytes(32).toString('hex');

        // Mock Email Sending
        console.log(`[INVITATION MOCK] To: ${email}, Subject: You're invited to manage a property! Link: /auth/invite?token=${token}`);

        return NextResponse.json({
            success: true,
            message: 'Invitation process initiated (Legacy database record skipped)'
        });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
