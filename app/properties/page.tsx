'use client';


import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertiesClient from '@/components/properties/PropertiesClient';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

interface Property {
    id: string;
    name: string;
    type: string | null;
    address: string;
    _count: { tenants: number };
    [key: string]: unknown;
}

export default function PropertiesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchProperties(user.uid);
        }
    }, [user, loading, router]);

    const fetchProperties = async (userId: string) => {
        setFetching(true);
        try {
            const q = query(
                collection(db, 'properties'),
                where('ownerUserId', '==', userId),
                // orderBy('createdAt', 'desc') // Requires index, might fail initially so careful
            );

            const querySnapshot = await getDocs(q);

            const mappedProperties = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();

                // Fetch tenant count (sub-collection or foreign key? 'tenants' collection has propertyId)
                let tenantCount = 0;
                try {
                    const tenantsQuery = query(collection(db, 'tenants'), where('propertyId', '==', docSnapshot.id));
                    const snapshot = await getCountFromServer(tenantsQuery);
                    tenantCount = snapshot.data().count;
                } catch (err) {
                    console.warn(`Failed to fetch tenant count for ${docSnapshot.id}`, err);
                }

                return {
                    id: docSnapshot.id,
                    ...data,
                    type: data.propertyType,
                    _count: {
                        tenants: tenantCount
                    }
                };
            }));

            // Sort manually if orderBy fails or index missing
            const props = mappedProperties as Property[];
            props.sort((a, b) => {
                const aSeconds = (a.createdAt as { seconds: number } | undefined)?.seconds || 0;
                const bSeconds = (b.createdAt as { seconds: number } | undefined)?.seconds || 0;
                return bSeconds - aSeconds;
            });

            setProperties(props);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setFetching(false);
        }
    };

    if (loading || fetching) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <PropertiesClient initialProperties={properties} />;
}
