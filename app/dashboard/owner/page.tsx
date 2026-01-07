'use client';
import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Users, Building, Loader2, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import Link from 'next/link';
import { FinancialSummaryCard } from '@/components/dashboard/FinancialSummaryCard';

interface DashboardStats {
    properties: number;
    tenants: number;
    financials: {
        revenue: number;
        expenses: number;
        netIncome: number;
        occupancyRate: number;
    };
}

export default function OwnerDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/owner/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch dashboard stats:', err);
                setLoading(false);
            });
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <DashboardShell role="owner">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Welcome */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Owner Overview</h1>
                    <p className="text-muted-foreground">Welcome back. Here is your portfolio performance at a glance.</p>
                </div>

                {/* Top Row: Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Properties Card */}
                    <Link href="/properties" className="block group">
                        <div className="bg-card/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                    <Building className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">View All</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.properties || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Properties</p>
                        </div>
                    </Link>

                    {/* Tenants Card */}
                    <Link href="/tenants" className="block group">
                        <div className="bg-card/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">View All</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.tenants || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Active Tenants</p>
                        </div>
                    </Link>

                    {/* Occupancy Rate Card */}
                    <div className="bg-card/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Percent className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${stats?.financials.occupancyRate.toFixed(1)}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">Occupancy Rate</p>
                    </div>

                    {/* Monthly Revenue Card */}
                    <div className="bg-card/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(stats?.financials.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                    </div>
                </div>

                {/* Middle Row: Detailed Financials & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Summary (Spans 2 cols) */}
                    <div className="lg:col-span-2">
                        <FinancialSummaryCard
                            revenue={stats?.financials.revenue || 0}
                            expenses={stats?.financials.expenses || 0}
                            netIncome={stats?.financials.netIncome || 0}
                            loading={loading}
                        />
                    </div>

                    {/* Quick Notifications / Insights (Spans 1 col) */}
                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-indigo-400" />
                            Portfolio Insights
                        </h3>
                        <div className="flex-1 space-y-4">
                            {/* Empty State / Placeholder for actual insights logic */}
                            {!loading && stats?.financials.occupancyRate && stats.financials.occupancyRate < 90 && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-200 font-medium">Occupancy Alert</p>
                                    <p className="text-xs text-red-300">Your occupancy is below 90%. Consider reviewing lease terms.</p>
                                </div>
                            )}
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                <p className="text-sm text-white font-medium">Market Trends</p>
                                <p className="text-xs text-muted-foreground">Local market rents have increased by 2.4% this month.</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/owner/insights"
                            className="block w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-sm text-white text-center rounded-lg transition-colors"
                        >
                            View All Insights
                        </Link>
                    </div>
                </div>

                {/* Bottom Section: Recent Activity Mock (To be real later) */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 text-sm text-muted-foreground">
                            No recent activity found.
                        </div>
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}
