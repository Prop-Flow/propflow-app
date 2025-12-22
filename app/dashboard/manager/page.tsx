'use client';

import { Users, Wrench, MessageSquare, Building, Bell, FileSignature } from 'lucide-react';
import React, { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import DocumentSigningModal from '@/components/documents/DocumentSigningModal';
import Link from 'next/link';

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        properties: 0,
        requests: 0,
        inquiries: 0,
        messages: 0
    });
    const [loading, setLoading] = useState(true);
    const [isSigningOpen, setIsSigningOpen] = useState(false);

    React.useEffect(() => {
        // Fetch stats
        fetch('/api/manager/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <DashboardShell role="manager">
            <DocumentSigningModal isOpen={isSigningOpen} onClose={() => setIsSigningOpen(false)} />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsSigningOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <FileSignature className="w-4 h-4 mr-2" />
                        Send Document
                    </button>
                </div>

                {/* Header Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Assigned Properties', value: stats.properties, icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-400/10', href: '/properties' },
                        { label: 'Active Requests', value: stats.requests, icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-400/10', href: '/maintenance' },
                        { label: 'Tenant Inquiries', value: stats.inquiries, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/tenants' },
                        { label: 'Unread Messages', value: stats.messages, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/communications' },
                    ].map((stat, i) => (
                        <Link key={i} href={stat.href} className="block group">
                            <div className="bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">{loading ? '-' : stat.value}</div>
                                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Owner Communication Section */}
                        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
                                        Owner Communication
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">Direct channel to property owners.</p>
                                </div>
                                <Link href="/communications" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    New Message
                                </Link>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">John Doe (Owner)</p>
                                                <p className="text-xs text-indigo-300">Re: HVAC Repair Approval - 123 Main St</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">10m ago</span>
                                    </div>
                                    <p className="text-sm text-gray-300 ml-11">
                                        Please proceed with the quote from Speedy Fix. Ensure they provide a warranty...
                                    </p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 opacity-70">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                                AS
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">Alice Smith (Owner)</p>
                                                <p className="text-xs text-indigo-300">Monthly Report Review</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">2h ago</span>
                                    </div>
                                    <p className="text-sm text-gray-300 ml-11">
                                        Thanks for the update. The occupancy numbers look great this month...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                                Urgent Tasks
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3 pb-3 border-b border-white/5">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium">Lease Renewal - Unit 4B</p>
                                        <p className="text-xs text-muted-foreground">Expires in 3 days</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 pb-3 border-b border-white/5">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium">Water Leak - Unit 1A</p>
                                        <p className="text-xs text-muted-foreground">Reported 1 hour ago</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
