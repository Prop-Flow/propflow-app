'use client';
import React, { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Users, Building, Activity, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboard() {
    const [stats, setStats] = useState({ properties: 0, tenants: 0 });
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        // Fetch properties and tenants counts
        Promise.all([
            fetch('/api/properties').then(res => res.json()),
            fetch('/api/tenants').then(res => res.json())
        ]).then(([propData, tenantData]) => {
            setStats({
                properties: propData.properties?.length || 0,
                tenants: tenantData.tenants?.length || 0
            });
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch dashboard stats:', err);
            setLoading(false);
        });
    }, []);

    return (
        <DashboardShell role="owner">
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    <Link href="/properties" className="block group">
                        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    <Building className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.properties}</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Total Properties</span>
                                <span className="text-xs text-muted-foreground mt-1">Active Portfolios</span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/tenants" className="block group">
                        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.tenants}</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Active Tenants</span>
                                <span className="text-xs text-muted-foreground mt-1">Tenant Overview</span>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8 text-center backdrop-blur-md">
                    <h3 className="text-xl font-bold text-white mb-4">Under Reconstruction</h3>
                    <p className="text-blue-200/80 max-w-xl mx-auto">
                        We are currently rebuilding the utility monitoring and financial optimization features to ensure better data isolation and performance.
                        Your core property and tenant data is safe and accessible.
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}
