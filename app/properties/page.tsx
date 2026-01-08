import PropertiesClient from '@/components/properties/PropertiesClient';
import { db } from '@/lib/services/firebase-admin';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function PropertiesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const propertiesSnapshot = await db.collection('properties')
        .where('ownerUserId', '==', session.user.id)
        .orderBy('createdAt', 'desc')
        .get();

    const mappedProperties = await Promise.all(propertiesSnapshot.docs.map(async doc => {
        const data = doc.data();

        // Fetch tenant count for this property
        const tenantsSnapshot = await db.collection('tenants')
            .where('propertyId', '==', doc.id)
            .count()
            .get();

        return {
            id: doc.id,
            ...data,
            type: data.propertyType,
            _count: {
                tenants: tenantsSnapshot.data().count
            }
        };
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PropertiesClient initialProperties={mappedProperties as any} />;
}
