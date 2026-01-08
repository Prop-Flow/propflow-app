import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find tenant by email
        const tSnapshot = await db.collection('tenants')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (tSnapshot.empty) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const tenant = tSnapshot.docs[0].data();
        const propertyId = tenant.propertyId;

        if (!propertyId) {
            return NextResponse.json({ managers: [], propertyName: 'No Property Assigned' });
        }

        // Get property
        const pDoc = await db.collection('properties').doc(propertyId).get();
        if (!pDoc.exists) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const property = pDoc.data();

        // Fetch managers. Assuming managerUserId stores the ID or properties have multiple.
        const managers = [];
        if (property?.managerUserId) {
            const mDoc = await db.collection('users').doc(property.managerUserId).get();
            if (mDoc.exists) {
                const mData = mDoc.data();
                managers.push({
                    id: mDoc.id,
                    firstName: mData?.firstName || mData?.name,
                    lastName: mData?.lastName || '',
                    email: mData?.email,
                    phone: mData?.phone
                });
            }
        }

        return NextResponse.json({
            managers,
            propertyName: property?.name || 'Unknown Property'
        });
    } catch (error) {
        console.error('Failed to fetch tenant manager:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
