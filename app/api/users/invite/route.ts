import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inviteManagerSchema } from '@/lib/validations/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // If user exists and propertyId is provided, grant them access immediately
            if (propertyId) {
                // Check if already managing to avoid duplicates (though Prisma handles unique constraints usually, implicit m-n doesn't strictly duplicate easily without raw queries or specific checks, but connect is safe)
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

        // Create Invitation for new user
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create invitation record
        await prisma.invitation.create({
            data: {
                email,
                role: 'PROPERTY_MANAGER',
                propertyId,
                token,
                expiresAt,
            }
        });

        // Mock Email Sending
        // In a real app, use Resend/SendGrid here
        console.log(`[MOCK EMAIL] To: ${email}, Subject: You're invited to manage a property! Link: /auth/invite?token=${token}`);

        return NextResponse.json({ success: true, message: 'Invitation sent' });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
