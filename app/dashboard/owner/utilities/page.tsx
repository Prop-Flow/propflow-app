'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Activity, Zap, Droplets, Flame, Loader2, ArrowRight, Building, AlertCircle } from 'lucide-react';
import { AnalysisResult, DetectionResult } from '@/lib/ai/anomaly-detection';
import Link from 'next/link';

export default function UtilitiesPage() {
    const [anomalyData, setAnomalyData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'anomaly'>('all');

    useEffect(() => {
        fetch('/api/analysis/anomalies')
            .then(res => res.json())
            .then(data => {
                setAnomalyData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch anomalies:', err);
                setLoading(false);
            });
    }, []);

    // Group results by property
    const propertiesMap = new Map<string, { name: string, utilities: DetectionResult[] }>();

    if (anomalyData && anomalyData.detection_results) {
        anomalyData.detection_results.forEach(result => {
            if (!propertiesMap.has(result.property_id)) {
                propertiesMap.set(result.property_id, {
                    name: result.property_name,
                    utilities: []
                });
            }
            propertiesMap.get(result.property_id)?.utilities.push(result);
        });
    }

    const properties = Array.from(propertiesMap.entries()).map(([id, data]) => ({
        id,
        ...data
    }));

    const filteredProperties = filter === 'all'
        ? properties
        : properties.filter(p => p.utilities.some(u => u.anomaly_detected));

    return (
        <DashboardShell role="owner">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center">
                            <Activity className="w-6 h-6 mr-3 text-indigo-400" />
                            Utility Monitoring
                        </h1>
                        <p className="text-muted-foreground mt-1">Real-time consumption tracking across your portfolio.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                        >
                            All Properties
                        </button>
                        <button
                            onClick={() => setFilter('anomaly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'anomaly' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                        >
                            Anomalies Only
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredProperties.map((property) => (
                            <div key={property.id} className="bg-card/30 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white tracking-tight">{property.name}</h3>
                                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                                                <Link href={`/properties?id=${property.id}`} className="hover:text-indigo-400 transition-colors">
                                                    View Property
                                                </Link>
                                                <span>•</span>
                                                <Link href={`/tenants?propertyId=${property.id}`} className="hover:text-indigo-400 transition-colors">
                                                    View Tenants
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <Link href={`/dashboard/manager?propertyId=${property.id}`} className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>

                                <div className="p-6 space-y-4">
                                    {property.utilities.map((utility, idx) => {
                                        const isAnomaly = utility.anomaly_detected;
                                        const Icon = utility.utility_type === 'Water' ? Droplets : utility.utility_type === 'Electric' ? Zap : Flame;
                                        const colorClass = utility.utility_type === 'Water' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : utility.utility_type === 'Electric' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-orange-400 bg-orange-400/10 border-orange-400/20';

                                        return (
                                            <div key={idx} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isAnomaly ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                                                <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                                                    <div className={`p-3 rounded-xl border ${colorClass} transition-colors group-hover:scale-105 duration-300`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="font-semibold text-lg text-white">{utility.utility_type}</span>
                                                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border shadow-sm ${isAnomaly ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                                                                {isAnomaly ? 'Anomaly Detected' : 'Normal'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                                                            <div className="text-sm text-muted-foreground">
                                                                Avg: <span className="text-white font-medium">{utility.baseline_average}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Current: <span className="text-white font-medium">{utility.recent_months && utility.recent_months.length > 0 ? utility.recent_months[utility.recent_months.length - 1].usage : 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        {isAnomaly && (
                                                            <div className="flex items-start mt-3 text-xs font-medium text-orange-200 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                                {utility.alert_message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 pl-0 sm:pl-6">
                                                    <div className="text-xs text-muted-foreground sm:text-right mb-0 sm:mb-1">Est. Cost Impact</div>
                                                    <div className={`text-lg font-bold ${isAnomaly ? 'text-orange-400' : 'text-white'}`}>
                                                        {isAnomaly ? `+$${utility.cost_impact_monthly}` : '--'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredProperties.length === 0 && (
                            <div className="col-span-full py-16 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-white/10">
                                <Activity className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                <p>No properties match the current filter.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
