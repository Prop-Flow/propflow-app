'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Download, Loader2 } from 'lucide-react';

interface DepreciationScheduleProps {
    propertyId: string;
}

interface ScheduleEntry {
    year: number;
    taxYear: number;
    depreciation: number;
    accumulatedDepreciation: number;
    remainingValue: number;
}

interface DepreciationData {
    hasData: boolean;
    property?: {
        id: string;
        name: string;
        purchasePrice: number;
        purchaseDate: string;
    };
    depreciation?: {
        purchasePrice: number;
        landValue: number;
        buildingValue: number;
        depreciableValue: number;
        annualDepreciation: number;
        firstYearDepreciation: number;
        recoveryPeriod: number;
    };
    schedule?: ScheduleEntry[];
    currentYear?: {
        year: number;
        depreciation: number;
        accumulated: number;
        estimatedTaxSavings: number;
    };
}

export default function DepreciationSchedule({ propertyId }: DepreciationScheduleProps) {
    const [data, setData] = useState<DepreciationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullSchedule, setShowFullSchedule] = useState(false);

    useEffect(() => {
        const fetchDepreciation = async () => {
            try {
                const response = await fetch(`/api/properties/${propertyId}/depreciation`);
                if (!response.ok) throw new Error('Failed to fetch depreciation data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDepreciation();
    }, [propertyId]);

    const exportToCSV = () => {
        if (!data?.schedule) return;

        const headers = ['Year', 'Tax Year', 'Annual Depreciation', 'Accumulated Depreciation', 'Remaining Value'];
        const rows = data.schedule.map(entry => [
            entry.year,
            entry.taxYear,
            entry.depreciation.toFixed(2),
            entry.accumulatedDepreciation.toFixed(2),
            entry.remainingValue.toFixed(2),
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `depreciation-schedule-${propertyId}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (error || !data?.hasData) {
        return (
            <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl border border-amber-500/20 p-6">
                <p className="text-sm text-amber-200">
                    No depreciation data available. Use the calculator above to set up depreciation tracking.
                </p>
            </div>
        );
    }

    const displaySchedule = showFullSchedule ? data.schedule : data.schedule?.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Current Year Summary */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-indigo-400" />
                    {data.currentYear?.year} Tax Year Write-Off
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-xs text-muted-foreground mb-1">Annual Depreciation</p>
                        <p className="text-2xl font-bold text-white">
                            ${data.currentYear?.depreciation.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-xs text-muted-foreground mb-1">Accumulated Total</p>
                        <p className="text-2xl font-bold text-white">
                            ${data.currentYear?.accumulated.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <p className="text-xs text-green-200 mb-1">Est. Tax Savings (24%)</p>
                        <p className="text-2xl font-bold text-green-400">
                            ${data.currentYear?.estimatedTaxSavings.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Property Breakdown */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Property Value Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                        <p className="text-lg font-semibold text-white">
                            ${data.depreciation?.purchasePrice.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Land Value</p>
                        <p className="text-lg font-semibold text-white">
                            ${data.depreciation?.landValue.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Building Value</p>
                        <p className="text-lg font-semibold text-white">
                            ${data.depreciation?.buildingValue.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-green-200 mb-1">Depreciable</p>
                        <p className="text-lg font-semibold text-green-400">
                            ${data.depreciation?.depreciableValue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Depreciation Schedule Table */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-white">Depreciation Schedule</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            27.5-year MACRS straight-line depreciation
                        </p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Year</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tax Year</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Depreciation</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Accumulated</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Remaining</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displaySchedule?.map((entry) => (
                                <tr key={entry.year} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-sm text-white">{entry.year}</td>
                                    <td className="px-4 py-3 text-sm text-white">{entry.taxYear}</td>
                                    <td className="px-4 py-3 text-sm text-white text-right font-medium">
                                        ${entry.depreciation.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                                        ${entry.accumulatedDepreciation.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                                        ${entry.remainingValue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.schedule && data.schedule.length > 5 && (
                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={() => setShowFullSchedule(!showFullSchedule)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            {showFullSchedule ? 'Show Less' : `Show All ${data.schedule.length} Years`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
