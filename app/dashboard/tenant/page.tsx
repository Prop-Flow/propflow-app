'use client';
import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TenantDashboard() {
    return (
        <DashboardShell role="tenant">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="md:col-span-2 space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl p-6 border border-primary/20">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome back, John!</h1>
                        <p className="text-muted-foreground">Here&apos;s a summary of your rental status and upcoming events.</p>
                    </div>

                    {/* Missing Lease Alert */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-4">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-orange-200">Lease Agreement Missing</h3>
                            <p className="text-xs text-orange-200/70 mt-1">
                                Please upload your signed lease agreement to complete your tenant profile.
                            </p>
                            <Link href="/dashboard/tenant/documents" className="mt-3 block w-fit text-xs bg-orange-500 text-white px-3 py-1.5 rounded-md hover:bg-orange-600 transition-colors font-medium">
                                Upload Lease
                            </Link>
                        </div>
                    </div>

                    {/* Rent Status */}
                    <div className="bg-card rounded-xl p-6 border border-white/5 shadow-sm">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Lease</h3>
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <div className="text-sm text-muted-foreground">Property</div>
                                <div className="font-medium text-foreground">Sunset Apartments, Unit 4B</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Monthly Rent</div>
                                <div className="font-bold text-2xl text-white">$2,400</div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm text-green-400 font-medium">Payment Current</span>
                            </div>
                            <Link href="/dashboard/tenant/payments" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                Pay Rent
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Manager Contact Widget (New) */}
                    <ManagerContactWidget />

                    {/* Quick Actions */}
                    <div className="bg-card rounded-xl p-6 border border-white/5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/tenant/maintenance" className="block w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                                Request Maintenance
                            </Link>
                            <Link href="/dashboard/tenant/documents" className="block w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                                View Documents
                            </Link>
                            <Link href="/communications" className="block w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                                Contact Property Manager
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function ManagerContactWidget() {
    const { user } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [manager, setManager] = React.useState<any>(null);

    React.useEffect(() => {
        if (user?.email) {
            fetch(`/api/tenants/me/managers?email=${user.email}`)
                .then(res => res.json())
                .then(data => {
                    if (data.managers && data.managers.length > 0) {
                        setManager(data.managers[0]);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [user?.email]);

    if (!manager) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-sm font-semibold text-indigo-100 uppercase tracking-wider mb-4">Property Manager</h3>
            <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    {manager.firstName?.[0]}{manager.lastName?.[0]}
                </div>
                <div>
                    <p className="font-bold text-lg">{manager.firstName} {manager.lastName}</p>
                    <p className="text-sm text-indigo-100">Property Manager</p>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                    <span className="opacity-70">Email:</span> {manager.email}
                </p>
                {manager.phone && (
                    <p className="flex items-center gap-2">
                        <span className="opacity-70">Phone:</span> {manager.phone}
                    </p>
                )}
            </div>
            <Link href="/communications" className="block w-full mt-4 text-center py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                Message Now
            </Link>
        </div>
    );
}

