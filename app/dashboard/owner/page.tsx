'use client';
import React, { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Users, Building, AlertCircle, Activity, CheckCircle, Loader2 } from 'lucide-react';
import { AnalysisResult } from '@/lib/ai/anomaly-detection';
import Link from 'next/link';

export default function OwnerDashboard() {
    const [anomalyData, setAnomalyData] = React.useState<AnalysisResult | null>(null);

    React.useEffect(() => {
        fetch('/api/analysis/anomalies')
            .then(res => res.json())
            .then(data => {
                setAnomalyData(data);
            })
            .catch(err => {
                console.error('Failed to fetch anomalies:', err);
            });
    }, []);



    return (
        <DashboardShell role="owner">
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Top Stats Row - High Visual Hierarchy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Properties', value: '10', icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: 'Active Portfolios', href: '/properties' },
                        { label: 'Active Tenants', value: '25', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', sub: '98% Occupancy Rate', href: '/tenants' },
                        { label: 'Pending Actions', value: anomalyData?.summary?.properties_with_anomalies?.toString() || '0', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: 'Detected Anomalies', href: '/dashboard/owner/utilities' },
                        { label: 'Compliance Health', value: '92%', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', sub: 'Across Portfolio', href: '/compliance' },
                    ].map((stat, i) => (
                        <Link key={i} href={stat.href} className="block group">
                            <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{stat.label}</span>
                                    <span className="text-xs text-muted-foreground mt-1">{stat.sub}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pending Tenants Widget */}
                    <PendingTenantsWidget />

                    {/* Utility Monitoring Card - Repositioned Lower */}
                    <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center mb-2">
                                    <Activity className="w-5 h-5 mr-2 text-indigo-400" />
                                    Utility Monitoring
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Track consumption across your portfolio
                                </p>
                            </div>
                            <Link
                                href="/dashboard/owner/utilities"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                View Details
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-400">Water</span>
                                    <Activity className="w-4 h-4 text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">Normal</p>
                                <p className="text-xs text-muted-foreground">All properties</p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-amber-400">Electric</span>
                                    <Activity className="w-4 h-4 text-amber-400" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">Normal</p>
                                <p className="text-xs text-muted-foreground">All properties</p>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-400">Gas</span>
                                    <Activity className="w-4 h-4 text-orange-400" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">Normal</p>
                                <p className="text-xs text-muted-foreground">All properties</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">AI Anomaly Detection</span>
                                <span className="text-green-400 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance / Activity Stats Side Panel */}
                <div className="space-y-8">
                    {/* Compliance Widget */}
                    <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Compliance Health</h3>
                        <div className="relative pt-2">
                            <div className="flex items-end space-x-2 mb-2">
                                <span className="text-3xl font-bold text-white">92%</span>
                                <span className="text-sm text-green-400 mb-1.5">+2%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[92%]" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                2 properties require attention regarding fire safety inspections.
                            </p>
                            <Link href="/compliance" className="block w-full mt-4 py-2 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10">
                                View Report
                            </Link>
                        </div>
                    </div>

                    {/* Property Managers Widget */}
                    <PropertyManagersWidget />

                    {/* Recent Activity Mini Feed */}
                    <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Latest Updates</h3>
                        <div className="space-y-4">
                            <div className="flex space-x-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm text-white">Maintenance request for Unit 3B completed.</p>
                                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-purple-500" />
                                <div>
                                    <p className="text-sm text-white">Rent payment received from Tenant John Doe.</p>
                                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function PendingTenantsWidget() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        fetch('/api/tenants/pending')
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch pending tenants');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setTenants(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch pending tenants", err);
                setError(err.message || 'Failed to load pending tenants');
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
        </div>
    );

    if (error) return (
        <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
            <p className="text-sm text-red-400">{error}</p>
        </div>
    );

    if (tenants.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-indigo-400 transform rotate-12" />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-400" />
                    Pending Tenant Approvals
                    <span className="ml-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{tenants.length}</span>
                </h3>

                <div className="space-y-3">
                    {tenants.map(t => (
                        <div key={t.id} className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5 hover:bg-black/30 transition-colors">
                            <div>
                                <p className="font-medium text-white">{t.name}</p>
                                <p className="text-xs text-indigo-200">{t.property?.name} • Unit {t.apartmentNumber}</p>
                            </div>
                            <Link href={`/tenants?status=pending`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md transition-colors block">
                                Review
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



function PropertyManagersWidget() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [managers, setManagers] = useState<any[]>([]);

    React.useEffect(() => {
        fetch('/api/managers')
            .then(res => res.json())
            .then(data => {
                if (data.managers) setManagers(data.managers);
            })
            .catch(err => console.error("Failed to fetch managers", err));
    }, []);

    return (
        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Property Managers
                </h3>
                <div className="space-y-3">
                    {managers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No managers assigned.</p>
                    ) : (
                        managers.map((manager, i) => (
                            <div key={manager.id || i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                        {manager.firstName?.[0]}{manager.lastName?.[0] || 'M'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{manager.firstName} {manager.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{manager.managedProperties?.length || 0} Properties</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">Active</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-sm font-medium text-white mb-3">Manage Team</p>
                <p className="text-xs text-muted-foreground mb-4">
                    To invite a new property manager, please visit the specific property page.
                </p>
                <Link
                    href="/properties"
                    className="block w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                >
                    View Properties
                </Link>
            </div>
        </div>
    );
}

