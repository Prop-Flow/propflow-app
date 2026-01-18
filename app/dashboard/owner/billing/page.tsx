'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { RubsCalculator } from '@/components/billing/RubsCalculator';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function BillingPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchBillingData = async () => {
            if (!user) return;

            try {
                const token = await user.getIdToken();

                // Fetch properties with tenants for billing
                const res = await fetch('/api/billing/properties', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setProperties(data.properties || []);
                }
            } catch (error) {
                console.error("Error fetching billing data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBillingData();
        }
    }, [user]);

    return (
        <DashboardShell role="owner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utility Billing</h1>
                    <p className="text-gray-500">Calculate and distribute utility costs using R.U.B.S.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    <RubsCalculator properties={properties as any} />
                )}
            </div>
        </DashboardShell>
    );
}
