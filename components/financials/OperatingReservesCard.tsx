'use client';

import React from 'react';
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface OperatingReservesCardProps {
    currentReserves: number;
    recommendedReserves: number;
    calculationReasoning?: string;
    onRecalculate?: () => void;
    onUpdate?: (amount: number) => void;
}

export default function OperatingReservesCard({
    currentReserves,
    recommendedReserves,
    calculationReasoning,
    onRecalculate,
    onUpdate
}: OperatingReservesCardProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [newAmount, setNewAmount] = React.useState(currentReserves);

    const percentage = recommendedReserves > 0
        ? (currentReserves / recommendedReserves) * 100
        : 0;

    const isHealthy = percentage >= 100;
    const isWarning = percentage >= 50 && percentage < 100;

    let reasoning;
    try {
        reasoning = calculationReasoning ? JSON.parse(calculationReasoning) : null;
    } catch {
        reasoning = null;
    }

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(newAmount);
        }
        setIsEditing(false);
    };

    return (
        <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center mb-2">
                        <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                        Operating Reserves
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Recommended cash cushion for unexpected expenses
                    </p>
                </div>
                <button
                    onClick={onRecalculate}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    Recalculate
                </button>
            </div>

            {/* Current vs Recommended */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Current Reserves</p>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(Number(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xl font-bold"
                            />
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-white">
                            ${currentReserves.toLocaleString()}
                        </p>
                    )}
                    {isEditing ? (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSave}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setNewAmount(currentReserves);
                                }}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                        >
                            Update
                        </button>
                    )}
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                    <p className="text-2xl font-bold text-white">
                        ${recommendedReserves.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Based on analysis
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Reserve Health</span>
                    <span className={`text-sm font-semibold ${isHealthy ? 'text-green-400' : isWarning ? 'text-orange-400' : 'text-red-400'
                        }`}>
                        {percentage.toFixed(0)}%
                    </span>
                </div>
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isHealthy ? 'bg-green-500' : isWarning ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Status Message */}
            <div className={`flex items-start gap-3 p-3 rounded-lg ${isHealthy ? 'bg-green-500/10 border border-green-500/20' :
                isWarning ? 'bg-orange-500/10 border border-orange-500/20' :
                    'bg-red-500/10 border border-red-500/20'
                }`}>
                {isHealthy ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                    <p className={`text-sm font-medium ${isHealthy ? 'text-green-400' : isWarning ? 'text-orange-400' : 'text-red-400'
                        }`}>
                        {isHealthy ? 'Healthy Reserve Level' :
                            isWarning ? 'Below Recommended Level' :
                                'Critical - Reserves Too Low'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {reasoning?.summary || 'Calculate reserves to see detailed recommendations'}
                    </p>
                </div>
            </div>

            {/* Calculation Breakdown */}
            {reasoning && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs font-semibold text-white mb-3">Calculation Breakdown</p>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Base ({reasoning.baseMonthsExpenses} months expenses)</span>
                            <span className="text-white">${reasoning.baseReserve?.toLocaleString()}</span>
                        </div>
                        {reasoning.ageAdjustment?.amount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Age Adjustment (+{reasoning.ageAdjustment.percentage}%)</span>
                                <span className="text-white">${reasoning.ageAdjustment.amount.toLocaleString()}</span>
                            </div>
                        )}
                        {reasoning.unitCountAdjustment?.amount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unit Count (+{reasoning.unitCountAdjustment.percentage}%)</span>
                                <span className="text-white">${reasoning.unitCountAdjustment.amount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
