'use client';

import { useParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import DepreciationCalculator from '@/components/tax/DepreciationCalculator';
import DepreciationSchedule from '@/components/tax/DepreciationSchedule';
import PropertyValuationCard from '@/components/financials/PropertyValuationCard';
import PropertyProjectionsCard from '@/components/financials/PropertyProjectionsCard';
import OperatingReservesCard from '@/components/financials/OperatingReservesCard';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, TrendingDown, TrendingUp, DollarSign, Wallet, Plus, AlertTriangle, Building } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

export default function PropertyFinancialsPage() {
    const params = useParams();
    const propertyId = params.id as string;
    const { user, loading: authLoading } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);

    // Financial State
    interface IncomeItem {
        id: string;
        source: string;
        customSourceName?: string;
        amount: number;
        frequency: string;
        description?: string;
    }

    interface ExpenseItem {
        id: string;
        category: string;
        customCategoryName?: string;
        amount: number;
        frequency: string;
        description?: string;
    }

    interface DebtItem {
        id: string;
        lenderName?: string;
        type: string;
        principalBalance: number;
        interestRate: number;
        monthlyPayment: number;
    }

    interface Financials {
        income: IncomeItem[];
        expenses: ExpenseItem[];
        debts: DebtItem[];
        currentReserves: number;
        recommendedReserves: number;
    }

    interface NetIncome {
        grossIncome: number;
        totalExpenses: number;
        vacancyLoss: number;
        monthlyNetIncome: number;
        annualNetIncome: number;
    }

    interface Valuation {
        estimatedValue: number;
        purchasePrice: number;
        totalAppreciation: number;
        appreciationRate: number;
        marketCapRate: number;
        confidence: string;
    }

    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [netIncome, setNetIncome] = useState<NetIncome | null>(null);
    const [valuation, setValuation] = useState<Valuation | null>(null);
    const [valuationHistory, setValuationHistory] = useState<Valuation[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [projections, setProjections] = useState<any>(null);

    // Modal State
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddIncome, setShowAddIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ source: 'rent', amount: 0, frequency: 'monthly', description: '', customSourceName: '' });
    const [newExpense, setNewExpense] = useState({ category: 'maintenance', amount: 0, frequency: 'monthly', description: '', customCategoryName: '' });

    const fetchFinancials = useCallback(async () => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/financials`);
            const data = await res.json();
            setFinancials(data);
        } catch (error) {
            console.error('Error fetching financials:', error);
        }
    }, [propertyId]);

    const fetchNetIncome = useCallback(async () => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/net-income`);
            const data = await res.json();
            setNetIncome(data);
        } catch (error) {
            console.error('Error fetching net income:', error);
        }
    }, [propertyId]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCalculateProjections = useCallback(async (assumptions?: any) => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/projections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assumptions || {})
            });
            const data = await res.json();
            setProjections(data);
        } catch (error) {
            console.error('Error calculating projections:', error);
        }
    }, [propertyId]);

    const handleCalculateValuation = useCallback(async () => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/valuation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            setValuation(data);

            // Refresh history
            const historyRes = await fetch(`/api/properties/${propertyId}/valuation`);
            const historyData = await historyRes.json();
            setValuationHistory(historyData.history || []);

            // Auto-calculate projections after valuation
            handleCalculateProjections();
        } catch (error) {
            console.error('Error calculating valuation:', error);
        }
    }, [propertyId, handleCalculateProjections]);

    const fetchValuation = useCallback(async () => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/valuation`);
            const data = await res.json();

            // If no valuation exists, calculate one automatically
            if (!data.current) {
                await handleCalculateValuation();
            } else {
                setValuation(data.current);
                setValuationHistory(data.history || []);
            }
        } catch (error) {
            console.error('Error fetching valuation:', error);
            // Try to calculate if fetch fails
            await handleCalculateValuation();
        }
    }, [propertyId, handleCalculateValuation]);

    const fetchProjections = useCallback(async () => {
        try {
            const res = await fetch(`/api/properties/${propertyId}/projections`);
            const data = await res.json();
            setProjections(data);
        } catch (error) {
            console.error('Error fetching projections:', error);
        }
    }, [propertyId]);

    useEffect(() => {
        if (propertyId) {
            setLoading(true);
            Promise.all([
                fetchFinancials(),
                fetchNetIncome(),
                fetchValuation(),
                fetchProjections()
            ]).finally(() => setLoading(false));
        }
    }, [propertyId, fetchFinancials, fetchNetIncome, fetchValuation, fetchProjections]);


    const handleRecalculateReserves = async () => {
        try {
            await fetch(`/api/properties/${propertyId}/reserves/calculate`, {
                method: 'POST'
            });
            fetchFinancials();
        } catch (error) {
            console.error('Error calculating reserves:', error);
        }
    };

    const handleAddIncome = async () => {
        try {
            await fetch(`/api/properties/${propertyId}/income`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIncome)
            });
            setShowAddIncome(false);
            setNewIncome({ source: 'rent', amount: 0, frequency: 'monthly', description: '', customSourceName: '' });
            fetchFinancials();
            fetchNetIncome();
        } catch (error) {
            console.error('Error adding income:', error);
        }
    };

    const handleAddExpense = async () => {
        try {
            await fetch(`/api/properties/${propertyId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            setShowAddExpense(false);
            setNewExpense({ category: 'maintenance', amount: 0, frequency: 'monthly', description: '', customCategoryName: '' });
            fetchFinancials();
            fetchNetIncome();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const handleDepreciationSaved = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const normalizedRole = user?.role?.toLowerCase();
    const currentRole = (normalizedRole === 'property_manager' ? 'manager' : normalizedRole) as "tenant" | "owner" | "manager" | undefined || 'owner';

    return (
        <DashboardShell role={currentRole}>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-emerald-400" />
                        Property Financials
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track valuation, income, expenses, and tax depreciation
                    </p>
                </div>

                {/* Net Income Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gross Income */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-md rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-200/70">Gross Income</p>
                                <p className="text-xl font-bold text-white">${netIncome?.grossIncome?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-md rounded-xl p-4 border border-red-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs text-red-200/70">Total Expenses</p>
                                <p className="text-xl font-bold text-white">${netIncome?.totalExpenses?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vacancy Loss */}
                    <div className="bg-gradient-to-br from-orange-900/40 to-yellow-900/40 backdrop-blur-md rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-orange-200/70">Vacancy Loss (5%)</p>
                                <p className="text-xl font-bold text-white">${netIncome?.vacancyLoss?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Net Operating Income */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md rounded-xl p-4 border border-indigo-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Wallet className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-200/70">Monthly NOI</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-white">${netIncome?.monthlyNetIncome?.toLocaleString() || 0}</p>
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Valuation & Projections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Always show valuation card with calculated or mock data */}
                    <PropertyValuationCard
                        currentValue={valuation?.estimatedValue || (netIncome?.annualNetIncome ? Math.round(netIncome.annualNetIncome / 0.07) : 1611429)}
                        purchasePrice={valuation?.purchasePrice || 1500000}
                        appreciation={valuation?.totalAppreciation || 111429}
                        appreciationRate={valuation?.appreciationRate || 1.21}
                        capRate={valuation?.marketCapRate || 7.0}
                        confidence={valuation?.confidence || 'MEDIUM'}
                        history={valuationHistory}
                    />

                    {projections && (
                        <PropertyProjectionsCard
                            currentValue={valuation?.estimatedValue || 0}
                            projections={projections.yearlyProjections}
                            assumptions={{
                                appreciationRate: projections.assumedAppreciation,
                                incomeGrowthRate: projections.assumedIncomeGrowth,
                                expenseGrowthRate: projections.assumedExpenseGrowth
                            }}
                            onRecalculate={handleCalculateProjections}
                        />
                    )}

                    {!projections && valuation && (
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                            <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Generate 5-Year Projections
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Forecast property value, equity, and cash flow growth
                            </p>
                            <button
                                onClick={() => handleCalculateProjections()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Generate Projections
                            </button>
                        </div>
                    )}
                </div>

                {/* Operating Reserves */}
                <OperatingReservesCard
                    currentReserves={financials?.currentReserves || 0}
                    recommendedReserves={financials?.recommendedReserves || 0}
                    onRecalculate={handleRecalculateReserves}
                />

                {/* Income & Expenses Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Income Sources */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Income Sources</h3>
                            <button
                                onClick={() => setShowAddIncome(true)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5 text-emerald-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {financials?.income?.map((inc: IncomeItem) => (
                                <div key={inc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {inc.source === 'custom' ? (inc.customSourceName || 'Custom Income') : inc.source.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">{inc.frequency}</p>
                                        </div>
                                    </div>
                                    <p className="text-white font-bold">${inc.amount.toLocaleString()}</p>
                                </div>
                            ))}
                            {(!financials?.income || financials.income.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No income sources recorded</p>
                            )}
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Expenses</h3>
                            <button
                                onClick={() => setShowAddExpense(true)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5 text-red-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {financials?.expenses?.map((exp: ExpenseItem) => (
                                <div key={exp.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {exp.category === 'other' ? (exp.customCategoryName || 'Other Expense') : exp.category.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">{exp.frequency}</p>
                                        </div>
                                    </div>
                                    <p className="text-white font-bold">${exp.amount.toLocaleString()}</p>
                                </div>
                            ))}
                            {(!financials?.expenses || financials.expenses.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Debt & Financing */}
                <div className="bg-slate-900/50 rounded-xl border border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Debt & Financing</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground border-b border-white/5">
                                    <th className="pb-3 pl-2">Lender</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3 text-right">Balance</th>
                                    <th className="pb-3 text-right">Rate</th>
                                    <th className="pb-3 text-right">Monthly Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financials?.debts?.map((debt: DebtItem) => (
                                    <tr key={debt.id} className="border-b border-white/5">
                                        <td className="py-3 pl-2 text-white font-medium">{debt.lenderName || 'Unknown Lender'}</td>
                                        <td className="py-3 text-muted-foreground capitalize">{debt.type}</td>
                                        <td className="py-3 text-right text-white">${debt.principalBalance.toLocaleString()}</td>
                                        <td className="py-3 text-right text-white">{debt.interestRate}%</td>
                                        <td className="py-3 text-right text-white">${debt.monthlyPayment.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!financials?.debts || financials.debts.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-muted-foreground">No debt records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tax Depreciation Section */}
                <div className="pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Building className="w-6 h-6 text-indigo-400" />
                        Tax Depreciation
                    </h2>

                    <div className="space-y-8">
                        <DepreciationCalculator
                            propertyId={propertyId}
                            onSave={handleDepreciationSaved}
                        />
                        <div key={refreshKey}>
                            <DepreciationSchedule propertyId={propertyId} />
                        </div>
                    </div>
                </div>

                {/* Add Income Modal */}
                {showAddIncome && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddIncome(false)}>
                        <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white mb-4">Add Income Source</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Source</label>
                                    <select
                                        value={newIncome.source}
                                        onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="rent">Rent</option>
                                        <option value="laundry">Laundry</option>
                                        <option value="parking">Parking</option>
                                        <option value="storage">Storage</option>
                                        <option value="rubs_utility">RUBS/Utility</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                {newIncome.source === 'custom' && (
                                    <div>
                                        <label className="text-sm text-slate-400 block mb-1">Custom Source Name</label>
                                        <input
                                            type="text"
                                            value={newIncome.customSourceName}
                                            onChange={(e) => setNewIncome({ ...newIncome, customSourceName: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                            placeholder="e.g., Vending Machines, Pet Fees"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={newIncome.amount}
                                        onChange={(e) => setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Frequency</label>
                                    <select
                                        value={newIncome.frequency}
                                        onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="annual">Annual</option>
                                        <option value="one_time">One Time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={newIncome.description}
                                        onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="e.g., 12 units @ $1,250/month"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAddIncome}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Add Income
                                    </button>
                                    <button
                                        onClick={() => setShowAddIncome(false)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Expense Modal */}
                {showAddExpense && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddExpense(false)}>
                        <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white mb-4">Add Expense</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Category</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="property_tax">Property Tax</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="water">Water</option>
                                        <option value="electric">Electric</option>
                                        <option value="gas">Gas</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="management_fees">Management Fees</option>
                                        <option value="capital_reserve">Capital Reserve</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {newExpense.category === 'other' && (
                                    <div>
                                        <label className="text-sm text-slate-400 block mb-1">Custom Category Name</label>
                                        <input
                                            type="text"
                                            value={newExpense.customCategoryName}
                                            onChange={(e) => setNewExpense({ ...newExpense, customCategoryName: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                            placeholder="e.g., HOA Fees, Landscaping"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Frequency</label>
                                    <select
                                        value={newExpense.frequency}
                                        onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="annual">Annual</option>
                                        <option value="one_time">One Time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="e.g., Annual property tax / 12"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAddExpense}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Add Expense
                                    </button>
                                    <button
                                        onClick={() => setShowAddExpense(false)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
