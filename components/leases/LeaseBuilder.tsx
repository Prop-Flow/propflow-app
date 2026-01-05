"use client";

import React, { useState } from 'react';
import { Loader2, FileText, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface LeaseBuilderProps {
    propertyId: string;
    tenants: any[]; // Ideally typed
    onComplete?: () => void;
}

export function LeaseBuilder({ propertyId, tenants, onComplete }: LeaseBuilderProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        tenantId: '',
        type: 'RESIDENTIAL', // RESIDENTIAL | COMMERCIAL
        startDate: '',
        endDate: '',
        rentAmount: '',
        securityDeposit: '',
        // Residential specific
        isFurnished: false,
        petsAllowed: false,
        // Commercial specific
        leaseType: 'GROSS', // GROSS, TRIPLE_NET, MODIFIED_GROSS
        escalationType: 'FIXED_PERCENTAGE',
        escalationValue: '3.0',
        maintenanceResponsibility: 'LANDLORD', // LANDLORD | TENANT | SHARED
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/leases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    propertyId,
                    rentAmount: Number(formData.rentAmount),
                    securityDeposit: Number(formData.securityDeposit),
                    escalationValue: formData.type === 'COMMERCIAL' ? Number(formData.escalationValue) : undefined,
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create lease draft');
            }

            setStep(4); // Success
            if (onComplete) onComplete();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                        Lease Drafter
                    </h2>
                    <p className="text-sm text-muted-foreground">AI-assisted agreement generation</p>
                </div>
                <div className="flex items-center space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-indigo-500' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            {/* Step 1: Basics */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Tenant</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.tenantId}
                                onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                            >
                                <option value="">Select Tenant...</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Lease Type</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="RESIDENTIAL">Residential</option>
                                <option value="COMMERCIAL">Commercial</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button onClick={nextStep} className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center">
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Financials & Terms */}
            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Monthly Rent ($)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.rentAmount}
                                onChange={e => setFormData({ ...formData, rentAmount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Security Deposit ($)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.securityDeposit}
                                onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Conditional Fields based on Type */}
                    {formData.type === 'COMMERCIAL' ? (
                        <div className="border-t border-white/5 pt-4 mt-4">
                            <h3 className="text-sm font-bold text-white mb-3">Commercial Terms</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Structure</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.leaseType}
                                        onChange={e => setFormData({ ...formData, leaseType: e.target.value })}
                                    >
                                        <option value="GROSS">Gross Lease</option>
                                        <option value="TRIPLE_NET">Triple Net (NNN)</option>
                                        <option value="MODIFIED_GROSS">Modified Gross</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Escalation ({formData.escalationType === 'FIXED_PERCENTAGE' ? '%' : '$'})</label>
                                    <div className="flex space-x-2">
                                        <select
                                            className="w-1/2 bg-black/20 border border-white/10 rounded-lg p-2 text-white text-xs"
                                            value={formData.escalationType}
                                            onChange={e => setFormData({ ...formData, escalationType: e.target.value })}
                                        >
                                            <option value="FIXED_PERCENTAGE">Fixed %</option>
                                            <option value="CPI">CPI</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="w-1/2 bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                            value={formData.escalationValue}
                                            onChange={e => setFormData({ ...formData, escalationValue: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-t border-white/5 pt-4 mt-4">
                            <h3 className="text-sm font-bold text-white mb-3">Residential Details</h3>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFurnished}
                                        onChange={e => setFormData({ ...formData, isFurnished: e.target.checked })}
                                        className="bg-black/20 border-white/10 rounded"
                                    />
                                    <span className="text-sm text-muted-foreground">Furnished</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.petsAllowed}
                                        onChange={e => setFormData({ ...formData, petsAllowed: e.target.checked })}
                                        className="bg-black/20 border-white/10 rounded"
                                    />
                                    <span className="text-sm text-muted-foreground">Pets Allowed</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        <button onClick={prevStep} className="px-4 py-2 bg-white/5 rounded-lg text-muted-foreground text-sm font-medium hover:bg-white/10 transition-colors flex items-center">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <button onClick={nextStep} className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center">
                            Review <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-black/20 rounded-xl p-4 space-y-2 border border-white/5">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="text-white font-medium">{formData.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Rent</span>
                            <span className="text-white font-medium">${formData.rentAmount}/mo</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Period</span>
                            <span className="text-white font-medium">{formData.startDate} - {formData.endDate}</span>
                        </div>
                        {formData.type === 'COMMERCIAL' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">escalation</span>
                                <span className="text-indigo-400 font-medium">{formData.escalationValue}% ({formData.escalationType})</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 mt-2">Create a new agreement or upload a file.</p>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div className="flex justify-between mt-6">
                        <button onClick={prevStep} className="px-4 py-2 bg-white/5 rounded-lg text-muted-foreground text-sm font-medium hover:bg-white/10 transition-colors flex items-center">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-sm font-bold hover:from-indigo-400 hover:to-purple-400 transition-all flex items-center disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Draft Agreement'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Lease Drafted Successfully!</h3>
                    <p className="text-muted-foreground mb-6">The agreement has been saved to the tenant's profile.</p>
                    <button
                        onClick={() => setStep(1)}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
                    >
                        Create Another
                    </button>
                </div>
            )}
        </div>
    );
}
