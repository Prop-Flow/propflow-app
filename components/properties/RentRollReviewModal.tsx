/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { RentRollData } from '@/lib/ai/document-parser';

interface RentRollReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RentRollData) => void;
    data: RentRollData;
}

export default function RentRollReviewModal({ isOpen, onClose, onSave, data }: RentRollReviewModalProps) {
    const [formData, setFormData] = useState<RentRollData>(data);
    const [verifiedUnits, setVerifiedUnits] = useState<Set<number>>(new Set());

    useEffect(() => {
        setFormData(data);
        setVerifiedUnits(new Set());
    }, [data]);

    if (!isOpen) return null;

    const handleVerifyStart = (index: number) => {
        const next = new Set(verifiedUnits);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setVerifiedUnits(next);
    };

    const handleUnitChange = (index: number, field: keyof RentRollData['units'][0], value: any) => {
        const newUnits = [...formData.units];
        newUnits[index] = { ...newUnits[index], [field]: value };
        setFormData({ ...formData, units: newUnits });
    };

    // Calculate totals for display
    const calculatedTotalRent = formData.units.reduce((sum, unit) => sum + (unit.currentRent || 0), 0);
    const occupancyRate = (formData.units.filter(u => u.tenantName && u.tenantName.toLowerCase() !== 'vacant').length / formData.units.length) * 100;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-white">Review Rent Roll Data</h2>
                        <p className="text-sm text-slate-400">
                            {formData.propertyAddress ? `Property: ${formData.propertyAddress}` : 'Review properties and tenants'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary Bar */}
                <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/10 flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400">Units: <strong className="text-white">{formData.units.length}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-400">Total Rent: <strong className="text-white">${calculatedTotalRent.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-400">Occupancy: <strong className="text-white">{occupancyRate.toFixed(0)}%</strong></span>
                    </div>
                </div>

                {/* Content - Table */}
                <div className="flex-1 overflow-auto bg-black/20">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 sticky top-0 z-10 shadow-sm text-xs uppercase text-slate-500 font-semibold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-white/5 pl-6">Unit #</th>
                                <th className="px-4 py-3 border-b border-white/5">Tenant Name</th>
                                <th className="px-4 py-3 border-b border-white/5">Monthly Rent</th>
                                <th className="px-4 py-3 border-b border-white/5">Deposit Held</th>
                                <th className="px-4 py-3 border-b border-white/5">Lease End Date</th>
                                <th className="px-4 py-3 border-b border-white/5 text-center">Verify</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-slate-900/40">
                            {formData.units.map((unit, index) => {
                                const isVerified = verifiedUnits.has(index);
                                return (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${isVerified ? 'bg-green-500/10' : ''}`}>
                                        <td className="px-4 py-2 pl-6">
                                            <input
                                                type="text"
                                                value={unit.unitNumber || ''}
                                                onChange={(e) => handleUnitChange(index, 'unitNumber', e.target.value)}
                                                className="w-16 bg-transparent border-none focus:ring-0 font-medium text-white text-sm"
                                                placeholder="#"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={unit.tenantName || ''}
                                                onChange={(e) => handleUnitChange(index, 'tenantName', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm text-white transition-all"
                                                placeholder="Tenant Name"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    value={unit.currentRent || ''}
                                                    onChange={(e) => handleUnitChange(index, 'currentRent', Number(e.target.value))}
                                                    className="w-24 pl-5 bg-transparent border border-transparent hover:border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded py-1 text-sm text-white transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    value={unit.deposit || ''}
                                                    onChange={(e) => handleUnitChange(index, 'deposit', Number(e.target.value))}
                                                    className="w-24 pl-5 bg-transparent border border-transparent hover:border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded py-1 text-sm text-white transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="relative">
                                                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
                                                <input
                                                    type="date"
                                                    value={unit.leaseEndDate || ''}
                                                    onChange={(e) => handleUnitChange(index, 'leaseEndDate', e.target.value)}
                                                    className="w-32 pl-7 bg-transparent border border-transparent hover:border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded py-1 text-sm text-white transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleVerifyStart(index)}
                                                className={`p-1.5 rounded-full transition-all ${isVerified
                                                    ? 'bg-green-600 text-white shadow-sm'
                                                    : 'text-slate-500 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                        {verifiedUnits.size} of {formData.units.length} units verified
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Confirm & Import All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
