'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null; // or loading
    }

    // Mock stats for MVP
    const stats = {
        properties: 12,
        tenants: 8,
        revenue: 42500,
        expenses: 12800,
        netIncome: 29700,
    };

    return (
        <DashboardShell role="owner">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 animate-in fade-in duration-500">

                {/* Left Column: Stats & Financials (Span 8) */}
                <div className="md:col-span-8 flex flex-col gap-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/properties" className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/50 to-slate-900/50 p-6 shadow-lg transition-all hover:shadow-emerald-500/10 hover:border-emerald-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
                                <Building2 className="h-8 w-8 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-emerald-200/70">Total Properties</p>
                            <p className="mt-2 text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">{stats.properties}</p>
                            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
                                <div className="h-full w-[70%] rounded-full bg-emerald-500/50" />
                            </div>
                        </Link>

                        <Link href="/tenants" className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/50 to-slate-900/50 p-6 shadow-lg transition-all hover:shadow-blue-500/10 hover:border-blue-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
                                <Users className="h-8 w-8 text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-blue-200/70">Active Tenants</p>
                            <p className="mt-2 text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{stats.tenants}</p>
                            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
                                <div className="h-full w-[85%] rounded-full bg-blue-500/50" />
                            </div>
                        </Link>
                    </div>

                    {/* Financial Overview */}
                    {/* Financial Overview */}
                    <RevenueChart
                        revenue={stats.revenue}
                        expenses={stats.expenses}
                        netIncome={stats.netIncome}
                    />
                </div>

                {/* Right Column: AI & Activity (Span 4) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <AIInsightCard />
                    <RecentActivity />
                </div>
            </div>
        </DashboardShell>
    );
}
