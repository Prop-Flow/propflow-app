import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Building code is required' }, { status: 400 });
        }

        const snapshot = await db.collection('properties')
            .where('buildingCode', '==', code)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Invalid building code' }, { status: 404 });
        }

        const propertyDoc = snapshot.docs[0];
        const data = propertyDoc.data();

        return NextResponse.json({
            property: {
                id: propertyDoc.id,
                name: data.name,
                address: data.address,
            }
        });
    } catch (error) {
        console.error('Error validating building code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
