'use client';


import { Users, Wrench, MessageSquare, Building, Bell, FileSignature, Activity } from 'lucide-react';
import React, { useState } from 'react';
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
        <>
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
                        {/* Communication Hub (Owner & Tenant) */}
                        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
                                        Communication Center
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">Central hub for Owner and Tenant messages.</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors border border-white/10">
                                        Filter
                                    </button>
                                    <Link href="/communications" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors">
                                        New Message
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Owner Thread */}
                                <div>
                                    <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Owner Updates</h4>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
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
                                        <p className="text-sm text-gray-300 ml-11 line-clamp-2">
                                            Please proceed with the quote from Speedy Fix. Ensure they provide a warranty for the motor replacement.
                                        </p>
                                    </div>
                                </div>

                                {/* Tenant Thread */}
                                <div>
                                    <h4 className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3">Tenant Inquiries</h4>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                                    SM
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Sarah Miller (Tenant)</p>
                                                    <p className="text-xs text-indigo-300">Unit 4B - Lease Renewal Question</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">1h ago</span>
                                        </div>
                                        <p className="text-sm text-gray-300 ml-11 line-clamp-2">
                                            Hi, I recieved the renewal notice. Is it possible to switch to a month-to-month plan instead of a full year?
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer mt-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                                    MJ
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Mike Johnson (Tenant)</p>
                                                    <p className="text-xs text-indigo-300">Unit 102 - Parking Spot</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">3h ago</span>
                                        </div>
                                        <p className="text-sm text-gray-300 ml-11 line-clamp-2">
                                            Someone has been parking in my assigned spot (A-12) for the last two nights. Can we address this?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Maintenance (Execution Focused) */}
                        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <Wrench className="w-5 h-5 mr-2 text-orange-400" />
                                    Active Maintenace
                                </h3>
                                <Link href="/maintenance" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase">In Progress</span>
                                        <span className="text-xs text-muted-foreground">Unit 1A</span>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">Water Leak - Kitchen Sink</p>
                                    <p className="text-xs text-gray-400">Vendor: Mario&apos;s Plumbing</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">Scheduled</span>
                                        <span className="text-xs text-muted-foreground">Common Area</span>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">Lobby Painting</p>
                                    <p className="text-xs text-gray-400">Vendor: Pro Painters Inc.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Urgent Action Items */}
                        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                                Action Required
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3 pb-3 border-b border-white/5">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium hover:text-indigo-400 cursor-pointer transition-colors">Lease Renewal - Unit 4B</p>
                                        <p className="text-xs text-muted-foreground">Expires in 3 days</p>
                                        <div className="mt-2 flex space-x-2">
                                            <Link href="/documents" className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">Prepare renewal</Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 pb-3 border-b border-white/5">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium hover:text-indigo-400 cursor-pointer transition-colors">Unit 1A Inspection</p>
                                        <p className="text-xs text-muted-foreground">Due: Today</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setIsSigningOpen(true)} className="flex items-center justify-center px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-medium transition-colors border border-indigo-500/30">
                                        <FileSignature className="w-3 h-3 mr-1.5" />
                                        Sign Doc
                                    </button>
                                    <Link href="/maintenance" className="flex items-center justify-center px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg text-xs font-medium transition-colors border border-orange-500/30">
                                        <Wrench className="w-3 h-3 mr-1.5" />
                                        Request
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Platform Updates Widget (New) */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6">
                            <h3 className="text-md font-bold text-white mb-4 flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                                Platform Updates
                            </h3>
                            <div className="space-y-4">
                                <div className="relative pl-4 border-l-2 border-indigo-500/30">
                                    <p className="text-xs text-indigo-300 font-semibold mb-0.5">New Feature</p>
                                    <p className="text-sm text-white font-medium">AI Lease Analysis</p>
                                    <p className="text-xs text-muted-foreground mt-1">Upload PDF leases and get instant term extraction.</p>
                                </div>
                                <div className="relative pl-4 border-l-2 border-purple-500/30">
                                    <p className="text-xs text-purple-300 font-semibold mb-0.5">Integration</p>
                                    <p className="text-sm text-white font-medium">Banking Connect</p>
                                    <p className="text-xs text-muted-foreground mt-1">Direct deposit reconciliation is now live.</p>
                                </div>
                            </div>
                            <Link href="/settings" className="block w-full mt-4 py-2 text-xs text-center text-indigo-300 hover:text-white transition-colors">
                                View Changelog
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
