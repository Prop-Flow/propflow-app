"use client";

import React, { useState } from 'react';
import { BillingBreakdown } from './BillingBreakdown';

interface SimpleProperty {
    id: string;
    name: string;
    address: string;
}

interface RubsCalculatorProps {
    properties: SimpleProperty[];
}

export const RubsCalculator: React.FC<RubsCalculatorProps> = ({ properties }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [totalUtilityCost, setTotalUtilityCost] = useState<number | ''>('');
    const [billingPeriod, setBillingPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [calculationResult, setCalculationResult] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveRecord, setSaveRecord] = useState(false);

    const handleCalculate = async () => {
        if (!selectedPropertyId || !totalUtilityCost) {
            setError("Please select a property and enter total cost.");
            return;
        }

        setLoading(true);
        setError(null);
        setCalculationResult(null);

        try {
            const res = await fetch('/api/billing/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: selectedPropertyId,
                    totalUtilityCost: Number(totalUtilityCost),
                    billingPeriod,
                    createRecord: saveRecord,
                    utilityType: 'total'
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Calculation failed');
            }

            const data = await res.json();
            setCalculationResult(data.breakdown);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">R.U.B.S Calculator</h2>
                        <p className="text-sm text-muted-foreground mt-1">Calculate utility splits based on square footage and occupancy.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Property</label>
                        <div className="relative">
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer hover:bg-white/10"
                                value={selectedPropertyId}
                                onChange={(e) => {
                                    setSelectedPropertyId(e.target.value);
                                    setCalculationResult(null);
                                }}
                            >
                                <option value="" className="bg-zinc-900 text-muted-foreground">-- Select Property --</option>
                                {properties.map((prop) => (
                                    <option key={prop.id} value={prop.id} className="bg-zinc-900">
                                        {prop.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billing Period</label>
                        <input
                            type="month"
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            value={billingPeriod}
                            onChange={(e) => setBillingPeriod(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Utility Cost ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-8 pr-4 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                                value={totalUtilityCost}
                                onChange={(e) => setTotalUtilityCost(Number(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center">
                        <input
                            id="save-record"
                            type="checkbox"
                            className="h-5 w-5 bg-white/5 border-white/10 rounded text-primary focus:ring-primary/50 transition-all cursor-pointer"
                            checked={saveRecord}
                            onChange={(e) => setSaveRecord(e.target.checked)}
                        />
                        <label htmlFor="save-record" className="ml-3 block text-sm font-medium text-muted-foreground cursor-pointer select-none">
                            Save record to billing history
                        </label>
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Calculating...
                            </>
                        ) : (
                            'Calculate Breakdown'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 flex items-center animate-in fade-in slide-in-from-top-2">
                        <svg className="h-5 w-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {calculationResult && (
                    <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <BillingBreakdown
                            items={calculationResult}
                            totalCost={typeof totalUtilityCost === 'number' ? totalUtilityCost : 0}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
