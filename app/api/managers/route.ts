import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export async function GET() {
    try {
        // Fetch all users with role property_manager.
        const snapshot = await db.collection('users')
            .where('role', '==', 'property_manager')
            .get();

        const managers = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            // Fetch managed properties (separate collection or mapping)
            const propsSnapshot = await db.collection('properties')
                .where('managerUserId', '==', doc.id)
                .get();

            return {
                id: doc.id,
                email: data.email,
                name: data.name,
                managedProperties: propsSnapshot.docs.map(p => ({ id: p.id, name: p.data().name }))
            };
        }));

        return NextResponse.json({ managers });
    } catch (error) {
        console.error('Failed to fetch managers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
