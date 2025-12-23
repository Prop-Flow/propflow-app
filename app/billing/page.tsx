
import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { RubsCalculator } from '@/components/billing/RubsCalculator';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function BillingPage() {
    const properties = await prisma.property.findMany({
        include: {
            tenants: true
        }
    });

    return (
        <DashboardShell role="owner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utility Billing</h1>
                    <p className="text-gray-500">Calculate and distribute utility costs using R.U.B.S.</p>
                </div>

                <RubsCalculator properties={properties} />
            </div>
        </DashboardShell>
    );
}
