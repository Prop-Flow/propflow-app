"use client";

import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface RentRollItem {
    id: string;
    tenantName: string;
    propertyName: string;
    unit: string;
    type: string;
    sqFt: number;
    rent: number;
    deposit: number;
    leaseStart: string;
    leaseEnd: string;
    daysUntilExpiration: number | null;
    riskStatus: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXPIRED';
    status: string;
}

interface RentRollSummary {
    totalMonthlyRent: number;
    totalDeposits: number;
    totalSqFt: number;
    occupancyCount: number;
    riskBreakdown: {
        critical: number;
        high: number;
        expired: number;
    }
}

interface RentRollData {
    generatedAt: string;
    summary: RentRollSummary;
    rentRoll: RentRollItem[];
}

export default function RentRollTable({ propertyId }: { propertyId?: string }) {
    const [data, setData] = useState<RentRollData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRentRoll = async () => {
            try {
                const query = propertyId ? `?propertyId=${propertyId}` : '';
                const res = await fetch(`/api/reports/rent-roll${query}`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch rent roll", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRentRoll();
    }, [propertyId]);

    const exportToCSV = () => {
        if (!data) return;

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Rent_Roll_${propertyId || 'Portfolio'}_${dateStr}.csv`;

        const csvData = data.rentRoll.map(item => ({
            "Unit": item.unit,
            "Tenant Name": item.tenantName,
            "Type": item.type,
            "Sq Ft": item.sqFt,
            "Market Rent": 0, // Placeholder
            "Actual Rent": item.rent,
            "Deposit": item.deposit,
            "Lease Start": item.leaseStart,
            "Lease End": item.leaseEnd,
            "Status": item.status,
            "Balance": 0 // Placeholder
        }));

        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rent Roll");
        XLSX.writeFile(wb, fileName);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Rent Roll...</div>;
    if (!data) return <div className="p-8 text-center text-red-400">Failed to load data</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <h2 className="text-xl font-bold text-white">Rent Roll</h2>
                    <p className="text-sm text-muted-foreground">Generated {new Date(data.generatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-black uppercase tracking-tight mb-1">Rent Roll</h1>
                        <p className="text-sm text-gray-600 font-medium">Portfolio Summary Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Date Generated</p>
                        <p className="text-sm font-bold text-black">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-6 print:mb-8 no-break">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 print:border-l-4 print:border-y-0 print:border-r-0 print:border-l-black print:bg-gray-50 print:rounded-none">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1 print:text-black font-number">${data.summary.totalMonthlyRent.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 print:border-l-4 print:border-y-0 print:border-r-0 print:border-l-black print:bg-gray-50 print:rounded-none">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-gray-500">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-white mt-1 print:text-black font-number">
                        {data.rentRoll.length > 0 ? Math.round((data.summary.occupancyCount / data.rentRoll.length) * 100) : 0}%
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 print:border-l-4 print:border-y-0 print:border-r-0 print:border-l-black print:bg-gray-50 print:rounded-none">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-gray-500">Total Deposits</p>
                    <p className="text-2xl font-bold text-white mt-1 print:text-black font-number">${data.summary.totalDeposits.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 print:border-l-4 print:border-y-0 print:border-r-0 print:border-l-black print:bg-gray-50 print:rounded-none">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-gray-500">Avg Rent / SF</p>
                    <p className="text-2xl font-bold text-white mt-1 print:text-black font-number">
                        ${data.summary.totalSqFt ? (data.summary.totalMonthlyRent / data.summary.totalSqFt).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Main Table */}
            <div className="mt-8 border rounded-xl overflow-hidden print:border-0 print:rounded-none bg-card print:bg-transparent border-white/10 print:mt-4">
                <table className="w-full text-sm text-left print:text-xs">
                    <thead className="bg-white/5 print:bg-gray-100 border-b border-white/10 print:border-black print:border-b-2">
                        <tr>
                            <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Unit</th>
                            <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Tenant</th>
                            <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black print:hidden">Type</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Sq Ft</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Market Rent</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Actual Rent</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Deposit</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Balance</th>
                            <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Lease End</th>
                            <th className="px-4 py-3 text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider print:text-black">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 print:divide-gray-200">
                        {data.rentRoll.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`
                                    hover:bg-white/5 transition-colors print:hover:bg-transparent
                                    ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02] print:bg-gray-50'}
                                `}
                            >
                                <td className="px-4 py-2.5 font-semibold text-white print:text-black">{item.unit}</td>
                                <td className="px-4 py-2.5 text-gray-300 print:text-black font-medium">{item.tenantName}</td>
                                <td className="px-4 py-2.5 text-gray-400 print:text-black print:hidden">{item.type}</td>
                                <td className="px-4 py-2.5 text-right text-gray-300 print:text-black font-number">{item.sqFt || '-'}</td>
                                <td className="px-4 py-2.5 text-right text-gray-400 print:text-black font-number">-</td>
                                <td className="px-4 py-2.5 text-right text-emerald-400 font-bold print:text-black font-number">${item.rent.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-right text-gray-400 print:text-black font-number">${item.deposit.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-right text-gray-400 print:text-black font-number">-</td>
                                <td className="px-4 py-2.5 text-right text-gray-300 print:text-black font-number">{item.leaseEnd}</td>
                                <td className="px-4 py-2.5 text-center">
                                    <span className={`
                                        inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                        ${item.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-400 print:bg-transparent print:text-black print:border print:border-black'
                                            : 'bg-gray-500/10 text-gray-400 print:bg-transparent print:text-gray-500 print:border print:border-gray-400'
                                        }
                                    `}>
                                        {item.status} ({item.riskStatus})
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {/* Summary Footer Row */}
                        <tr className="bg-white/5 print:bg-gray-100 border-t-2 border-white/20 print:border-black font-bold text-white print:text-black">
                            <td className="px-4 py-3" colSpan={3}>Totals</td>
                            <td className="px-4 py-3 text-right">{data.summary.totalSqFt?.toLocaleString() || '-'}</td>
                            <td className="px-4 py-3 text-right">${data.summary.totalMonthlyRent.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">${data.summary.totalDeposits.toLocaleString()}</td>
                            <td className="px-4 py-3" colSpan={2}></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-muted-foreground print:text-gray-500 mt-4 italic">
                * Risk Status calculated based on lease expiration and tenant payment history.
            </div>
        </div>
    );
}

function renderRiskBadge(status: string) {
    switch (status) {
        case 'CRITICAL':
        case 'EXPIRED':
            return <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">CRITICAL</span>;
        case 'HIGH':
            return <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400">HIGH</span>;
        case 'MEDIUM':
            return <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">MEDIUM</span>;
        default:
            return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">STABLE</span>;
    }
}
