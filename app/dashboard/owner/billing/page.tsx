import React from 'react';
import { prisma } from '@/lib/prisma';
import { RubsCalculator } from '@/components/billing/RubsCalculator';
import DashboardShell from '@/components/layout/DashboardShell';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    // Fetch properties to pass to the calculator
    const properties = await prisma.property.findMany({
        where: {
            ownerUserId: session.user.id
        },
        select: {
            id: true,
            name: true,
            address: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <DashboardShell role="owner">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Utility Billing Center</h1>
                <p className="text-muted-foreground mt-2">
                    Calculate and manage Ratio Utility Billing Systems (R.U.B.S) for your properties.
                </p>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                    <RubsCalculator properties={properties} />
                </section>
            </div>
        </DashboardShell>
    );
}
