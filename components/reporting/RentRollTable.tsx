"use client";

import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
            "Tenant Name": item.tenantName,
            "Property": item.propertyName,
            "Unit": item.unit,
            "Type": item.type,
            "Sq Ft": item.sqFt,
            "Monthly Rent": item.rent,
            "Security Deposit": item.deposit,
            "Lease Start": item.leaseStart,
            "Lease End": item.leaseEnd,
            "Status": item.status,
            "Risk Status": item.riskStatus
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Rent Roll</h2>
                    <p className="text-sm text-muted-foreground">Generated {new Date(data.generatedAt).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase">Monthly Rent</p>
                    <p className="text-xl font-bold text-white">${data.summary.totalMonthlyRent.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase">Occupancy</p>
                    <p className="text-xl font-bold text-white">{data.summary.occupancyCount} Units</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase">Deposits Held</p>
                    <p className="text-xl font-bold text-white">${data.summary.totalDeposits.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase">Avg Rent/SqFt</p>
                    <p className="text-xl font-bold text-white">
                        ${data.summary.totalSqFt ? (data.summary.totalMonthlyRent / data.summary.totalSqFt).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Turnover Risk Alert */}
            {(data.summary.riskBreakdown.high > 0 || data.summary.riskBreakdown.critical > 0) && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-200">Turnover Risk Detected</h4>
                        <p className="text-xs text-orange-200/70 mt-1">
                            {data.summary.riskBreakdown.critical} leases expiring in {"<"}30 days, {data.summary.riskBreakdown.high} in {"<"}90 days.
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground font-medium uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Unit</th>
                                <th className="px-4 py-3 text-right">Rent</th>
                                <th className="px-4 py-3 text-right">Lease End</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Risk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.rentRoll.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{item.tenantName}</td>
                                    <td className="px-4 py-3 text-gray-300">{item.unit}</td>
                                    <td className="px-4 py-3 text-right text-gray-300">${item.rent.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-gray-300">{item.leaseEnd}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {renderRiskBadge(item.riskStatus)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
