import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { RubsCalculator } from '@/components/billing/RubsCalculator';
import { db } from '@/lib/services/firebase-admin';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
    const propsSnapshot = await db.collection('properties').get();

    const properties = await Promise.all(propsSnapshot.docs.map(async doc => {
        const data = doc.data();
        const tenantsSnapshot = await db.collection('tenants')
            .where('propertyId', '==', doc.id)
            .get();

        return {
            id: doc.id,
            ...data,
            tenants: tenantsSnapshot.docs.map(t => ({ id: t.id, ...t.data() }))
        };
    }));

    return (
        <DashboardShell role="owner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utility Billing</h1>
                    <p className="text-gray-500">Calculate and distribute utility costs using R.U.B.S.</p>
                </div>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RubsCalculator properties={properties as any} />
            </div>
        </DashboardShell>
    );
}
