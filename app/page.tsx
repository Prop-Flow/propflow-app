import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getComplianceStatus } from '@/lib/utils/date-helpers';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
    const [properties, tenants, complianceItems, recentLogs] = await Promise.all([
        prisma.property.count(),
        prisma.tenant.count({ where: { status: 'active' } }),
        prisma.complianceItem.findMany({
            where: {
                status: {
                    in: ['pending', 'overdue'],
                },
            },
            include: {
                tenant: true,
                property: true,
            },
            orderBy: {
                dueDate: 'asc',
            },
            take: 10,
        }),
        prisma.communicationLog.findMany({
            include: {
                tenant: {
                    include: {
                        property: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        }),
    ]);

    const overdueCount = complianceItems.filter(item =>
        getComplianceStatus(item.dueDate) === 'overdue'
    ).length;

    const urgentCount = complianceItems.filter(item =>
        getComplianceStatus(item.dueDate) === 'urgent'
    ).length;

    return {
        properties,
        tenants,
        overdueCount,
        urgentCount,
        complianceItems,
        recentLogs,
    };
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Propflow AI
                            </h1>
                            <p className="text-slate-600 mt-1">Property Management Automation</p>
                        </div>
                        <nav className="flex gap-6">
                            <Link href="/properties" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Properties
                            </Link>
                            <Link href="/tenants" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Tenants
                            </Link>
                            <Link href="/compliance" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Compliance
                            </Link>
                            <Link href="/communications" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Communications
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Properties</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.properties}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Active Tenants</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.tenants}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Overdue Items</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueCount}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Urgent Tasks</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.urgentCount}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Compliance Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Compliance Alerts</h2>
                            <Link href="/compliance" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.complianceItems.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No pending compliance items</p>
                            ) : (
                                stats.complianceItems.map((item) => {
                                    const status = getComplianceStatus(item.dueDate);
                                    const statusColors = {
                                        overdue: 'bg-red-100 text-red-700 border-red-200',
                                        urgent: 'bg-orange-100 text-orange-700 border-orange-200',
                                        upcoming: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                        future: 'bg-blue-100 text-blue-700 border-blue-200',
                                    };

                                    return (
                                        <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {item.tenant?.name} • {item.property?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Due: {item.dueDate.toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                                                    {status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                            <Link href="/communications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.recentLogs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No recent activity</p>
                            ) : (
                                stats.recentLogs.map((log) => {
                                    const channelColors = {
                                        sms: 'bg-blue-100 text-blue-700',
                                        email: 'bg-purple-100 text-purple-700',
                                        voice: 'bg-green-100 text-green-700',
                                    };

                                    return (
                                        <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${channelColors[log.channel as keyof typeof channelColors]}`}>
                                                    {log.channel.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {log.direction === 'outbound' ? '→' : '←'} {log.tenant.name}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 line-clamp-2">{log.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/properties?action=new" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105">
                            <h3 className="font-semibold mb-2">Add Property</h3>
                            <p className="text-sm text-white/80">Register a new property</p>
                        </Link>
                        <Link href="/tenants?action=new" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105">
                            <h3 className="font-semibold mb-2">Add Tenant</h3>
                            <p className="text-sm text-white/80">Onboard a new tenant</p>
                        </Link>
                        <Link href="/compliance" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105">
                            <h3 className="font-semibold mb-2">Run Compliance Check</h3>
                            <p className="text-sm text-white/80">Scan for upcoming deadlines</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
