'use client';

import { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';
import { UtilityKPICards } from '@/components/utilities/UtilityKPICards';
import { ConsumptionChart } from '@/components/utilities/ConsumptionChart';
import { ReadingsTable } from '@/components/utilities/ReadingsTable';
import { AddReadingModal } from '@/components/utilities/AddReadingModal';

export default function UtilitiesPage() {
    const { user, loading } = useAuth();
    const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentRole = (user?.role === 'property_manager' ? 'manager' : user?.role as "tenant" | "owner" | "manager") || 'owner';

    // Mock aggregate metrics
    const metrics = {
        totalCost: 12450,
        recoveryRate: 88,
        anomalies: 2,
        waterUsage: 12000,
        electricUsage: 45000,
        gasUsage: 300
    };

    return (
        <DashboardShell role={currentRole}>
            <div className="flex flex-col space-y-8 animate-in fade-in-50 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Utility Management</h1>
                        <p className="text-muted-foreground mt-1">Monitor consumption, track RUBS recovery, and detect anomalies.</p>
                    </div>
                    <button
                        onClick={() => setIsAddReadingOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Reading
                    </button>
                </div>

                <UtilityKPICards metrics={metrics} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                    <div className="lg:col-span-2 h-full">
                        <ConsumptionChart />
                    </div>
                    <div className="h-full">
                        <ReadingsTable />
                    </div>
                </div>
            </div>

            <AddReadingModal
                isOpen={isAddReadingOpen}
                onClose={() => setIsAddReadingOpen(false)}
            />
        </DashboardShell>
    );
}
