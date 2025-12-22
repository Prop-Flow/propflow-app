'use client';

import React, { useState } from 'react';
import { LineChart, TrendingUp, DollarSign, Settings } from 'lucide-react';

interface ProjectionYear {
    year: number;
    value: number;
    noi: number;
    cashFlow: number;
    equity: number;
}

interface PropertyProjectionsCardProps {
    currentValue: number;
    projections: ProjectionYear[];
    assumptions: {
        appreciationRate: number;
        incomeGrowthRate: number;
        expenseGrowthRate: number;
    };
    onRecalculate?: (newAssumptions: { appreciationRate: number; incomeGrowthRate: number; expenseGrowthRate: number }) => void;
}

export default function PropertyProjectionsCard({
    currentValue,
    projections = [],
    assumptions,
    onRecalculate
}: PropertyProjectionsCardProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [localAssumptions, setLocalAssumptions] = useState(assumptions);

    const finalYear = projections[projections.length - 1];
    const totalGrowth = finalYear ? ((finalYear.value - currentValue) / currentValue) * 100 : 0;

    const handleRecalculate = () => {
        if (onRecalculate) {
            onRecalculate(localAssumptions);
        }
        setShowSettings(false);
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChart className="w-6 h-6 text-blue-400" />
                    5-Year Projections
                </h3>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                    <Settings className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-semibold text-white mb-4">Projection Assumptions</h4>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">
                                Annual Appreciation Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={localAssumptions.appreciationRate}
                                onChange={(e) => setLocalAssumptions({
                                    ...localAssumptions,
                                    appreciationRate: parseFloat(e.target.value)
                                })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 block mb-1">
                                Income Growth Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={localAssumptions.incomeGrowthRate}
                                onChange={(e) => setLocalAssumptions({
                                    ...localAssumptions,
                                    incomeGrowthRate: parseFloat(e.target.value)
                                })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 block mb-1">
                                Expense Growth Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={localAssumptions.expenseGrowthRate}
                                onChange={(e) => setLocalAssumptions({
                                    ...localAssumptions,
                                    expenseGrowthRate: parseFloat(e.target.value)
                                })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>

                        <button
                            onClick={handleRecalculate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Recalculate Projections
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-slate-400">Projected Value (Year 5)</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${finalYear?.value.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">
                        +{totalGrowth.toFixed(1)}% growth
                    </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <p className="text-xs text-slate-400">Projected Equity</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                        ${finalYear?.equity.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Total equity buildup
                    </p>
                </div>
            </div>

            {/* Projection Chart */}
            {projections.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-end gap-2 h-32">
                        {projections.map((year, index) => {
                            const maxValue = Math.max(...projections.map(p => p.value));
                            const height = (year.value / maxValue) * 100;

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer group relative"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                                                ${year.value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">Y{year.year}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Yearly Breakdown Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="text-left text-xs text-slate-400 pb-2">Year</th>
                            <th className="text-right text-xs text-slate-400 pb-2">Value</th>
                            <th className="text-right text-xs text-slate-400 pb-2">NOI</th>
                            <th className="text-right text-xs text-slate-400 pb-2">Cash Flow</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projections.map((year) => (
                            <tr key={year.year} className="border-b border-slate-800/50">
                                <td className="py-2 text-white font-medium">{year.year}</td>
                                <td className="py-2 text-right text-white">
                                    ${year.value.toLocaleString()}
                                </td>
                                <td className="py-2 text-right text-emerald-400">
                                    ${year.noi.toLocaleString()}
                                </td>
                                <td className="py-2 text-right text-blue-400">
                                    ${year.cashFlow.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assumptions Display */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Current Assumptions:</p>
                <div className="flex gap-4 text-xs">
                    <span className="text-slate-300">
                        Appreciation: <strong>{assumptions.appreciationRate}%</strong>
                    </span>
                    <span className="text-slate-300">
                        Income Growth: <strong>{assumptions.incomeGrowthRate}%</strong>
                    </span>
                    <span className="text-slate-300">
                        Expense Growth: <strong>{assumptions.expenseGrowthRate}%</strong>
                    </span>
                </div>
            </div>
        </div>
    );
}
