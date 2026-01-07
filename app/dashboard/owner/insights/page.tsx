'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import { Construction } from 'lucide-react';

export default function InsightsPage() {
    return (
        <DashboardShell role="owner">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center animate-in fade-in duration-500">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <Construction className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-white">Insights & Analytics</h1>
                <p className="text-muted-foreground max-w-md">
                    We are currently building advanced analytics for your portfolio. Check back soon for deeper insights into revenue trends and market data.
                </p>
            </div>
        </DashboardShell>
    );
}
