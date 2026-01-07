import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react';

interface FinancialSummaryProps {
    revenue: number;
    expenses: number;
    netIncome: number;
    loading?: boolean;
}

export function FinancialSummaryCard({ revenue, expenses, netIncome, loading }: FinancialSummaryProps) {
    if (loading) {
        return <div className="animate-pulse h-48 bg-card/40 rounded-2xl"></div>;
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const margin = revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : '0';

    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-400" />
                    Monthly Financials
                </h3>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Estimated</span>
            </div>

            <div className="space-y-6">
                {/* Net Income Hero */}
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Net Operating Income</p>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-white">{formatCurrency(netIncome)}</span>
                        <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${Number(margin) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {margin}% Margin
                        </span>
                    </div>
                </div>

                {/* Bars */}
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-300">Revenue</span>
                            <span className="text-white">{formatCurrency(revenue)}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-rose-300">Expenses</span>
                            <span className="text-white">{formatCurrency(expenses)}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            {/* Simple proportional width for expense bar */}
                            <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${Math.min(100, (expenses / (revenue || 1)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
