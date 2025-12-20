
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Building2, Users, AlertCircle, AlertTriangle, Droplets } from 'lucide-react';
import { getComplianceStatus } from '@/lib/utils/date-helpers';
import DashboardShell from '@/components/layout/DashboardShell';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeProperties, PropertyData } from '@/lib/ai/anomaly-detection';

import { Property, Tenant, ComplianceItem, CommunicationLog } from '@prisma/client';

export const dynamic = 'force-dynamic';

type ComplianceItemWithDetails = ComplianceItem & {
    tenant: Tenant | null;
    property: Property | null;
};

type CommunicationLogWithDetails = CommunicationLog & {
    tenant: Tenant & {
        property: Property | null;
    };
};

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

    // Anomaly Detection Analysis
    let anomalyData = null;
    try {
        const dataPath = path.join(process.cwd(), 'lib/ai/demo-dataset.json');
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const demoData = JSON.parse(rawData);
            const dataset: PropertyData[] = demoData.properties.map((p: { property_id: string; property_name: string; monthly_usage: { month: string; usage: number }[] }) => ({
                property_id: p.property_id,
                property_name: p.property_name,
                usage_history: p.monthly_usage
            }));
            anomalyData = analyzeProperties(dataset);
        }
    } catch (e) {
        console.error("Failed to load anomaly data", e);
    }

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
        anomalyData
    };
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <DashboardShell role="owner">
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
                            <p className="text-sm font-medium text-slate-600">Utility Anomalies</p>
                            <p className={`text-3xl font-bold mt-2 ${(stats.anomalyData?.summary.properties_with_anomalies || 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                {stats.anomalyData?.summary.properties_with_anomalies || 0}
                            </p>
                        </div>
                        <div className={`${(stats.anomalyData?.summary.properties_with_anomalies || 0) > 0 ? 'bg-amber-100' : 'bg-slate-100'} p-3 rounded-lg`}>
                            <Droplets className={`w-6 h-6 ${(stats.anomalyData?.summary.properties_with_anomalies || 0) > 0 ? 'text-amber-600' : 'text-slate-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Anomalies Alert Bar */}
            {(stats.anomalyData?.summary.properties_with_anomalies || 0) > 0 && stats.anomalyData && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-amber-900 font-semibold">Utility Consumption Anomalies Detected</p>
                        <p className="text-amber-700 text-sm">AI has identified {stats.anomalyData.summary.properties_with_anomalies} properties with unusual water usage patterns.</p>
                    </div>
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                        Investigate All
                    </button>
                </div>
            )}

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Utility Anomalies */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Utility Anomalies</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">AI POWERED</span>
                    </div>
                    <div className="space-y-4">
                        {(stats.anomalyData?.detection_results || []).filter(r => r.anomaly_detected).length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No utility anomalies detected</p>
                        ) : (
                            (stats.anomalyData?.detection_results || [])
                                .filter(r => r.anomaly_detected)
                                .map(anomaly => {
                                    const severityColors = {
                                        high: 'bg-red-100 text-red-700 border-red-200',
                                        medium: 'bg-orange-100 text-orange-700 border-orange-200',
                                        low: 'bg-blue-100 text-blue-700 border-blue-200',
                                    };

                                    return (
                                        <div key={anomaly.property_id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-slate-900">{anomaly.property_name}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColors[anomaly.severity as keyof typeof severityColors]}`}>
                                                    {anomaly.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-snug">{anomaly.alert_message}</p>
                                            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                                                <span className="font-medium text-red-600">Impact: +${anomaly.cost_impact_monthly}/mo</span>
                                                <button className="text-blue-600 font-bold hover:underline">NOTIFY TENANT</button>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

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
                            stats.complianceItems.map((item: ComplianceItemWithDetails) => {
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
                            stats.recentLogs.map((log: CommunicationLogWithDetails) => {
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
        </DashboardShell>
    );
}
