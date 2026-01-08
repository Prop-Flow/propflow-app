import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
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

        // SECURITY CHECK: Verify if the session user owns the property
        if (propertyId) {
            const propertyDoc = await db.collection('properties').doc(propertyId).get();
            const propertyData = propertyDoc.data();

            if (!propertyDoc.exists || propertyData?.ownerUserId !== user.id) {
                return NextResponse.json({ error: 'You do not have permission to invite managers to this property' }, { status: 403 });
            }
        }

        // Check if user already exists in Firestore
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!userSnapshot.empty) {
            const existingUser = userSnapshot.docs[0];

            // If user exists and propertyId is provided, grant them access immediately
            if (propertyId) {
                await db.collection('properties').doc(propertyId).update({
                    managerUserId: existingUser.id // Simplified: 1 manager per property for now
                    // Or if multiple: managerIds: admin.firestore.FieldValue.arrayUnion(existingUser.id)
                });
                return NextResponse.json({ success: true, message: 'Existing user added as manager to property.' });
            }

            return NextResponse.json({ message: 'User already exists in the system.' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        // Logic for creating an invitation record in Firestore could be added here

        // Mock Email Sending
        console.log(`[INVITATION MOCK] To: ${email}, Subject: You're invited to manage a property! Link: /auth/invite?token=${token}`);

        return NextResponse.json({
            success: true,
            message: 'Invitation process initiated'
        });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
