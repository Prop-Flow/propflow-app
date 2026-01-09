import PropertiesClient from '@/components/properties/PropertiesClient';
import { db } from '@/lib/services/firebase-admin';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function PropertiesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mappedProperties: any[] = [];
    try {
        const propertiesSnapshot = await db.collection('properties')
            .where('ownerUserId', '==', session.user.id)
            .orderBy('createdAt', 'desc')
            .get();

        mappedProperties = await Promise.all(propertiesSnapshot.docs.map(async doc => {
            const data = doc.data();

            // Fetch tenant count for this property
            let tenantCount = 0;
            try {
                const tenantsSnapshot = await db.collection('tenants')
                    .where('propertyId', '==', doc.id)
                    .count()
                    .get();
                tenantCount = tenantsSnapshot.data().count;
            } catch (err) {
                console.warn(`Failed to fetch tenant count for property ${doc.id}:`, err);
            }

            return {
                id: doc.id,
                ...data,
                type: data.propertyType,
                _count: {
                    tenants: tenantCount
                }
            };
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error fetching properties:", error);
        // If index is missing, firestore throws FAILED_PRECONDITION
        if (error.code === 9) { // FAILED_PRECONDITION
            console.warn("Missing Firestore Index. Falling back to empty list for now.");
        }
        // In a real app, we might check for index missing error specifically
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PropertiesClient initialProperties={mappedProperties as any} />;
}
