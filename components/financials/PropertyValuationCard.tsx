'use client';

import React from 'react';
import { TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';

interface PropertyValuationCardProps {
    currentValue?: number;
    purchasePrice?: number;
    appreciation?: number;
    appreciationRate?: number;
    capRate?: number;
    confidence?: string;
    history?: { estimatedValue: number }[];
}

export default function PropertyValuationCard({
    currentValue = 0,
    purchasePrice = 0,
    appreciation = 0,
    appreciationRate = 0,
    capRate = 0,
    confidence = 'MEDIUM',
    history = []
}: PropertyValuationCardProps) {
    const confidenceColor = {
        'HIGH': 'text-green-400 bg-green-500/20',
        'MEDIUM': 'text-yellow-400 bg-yellow-500/20',
        'LOW': 'text-orange-400 bg-orange-500/20'
    }[confidence] || 'text-slate-400 bg-slate-500/20';

    const hasAppreciation = purchasePrice > 0;
    const appreciationPercent = hasAppreciation ? ((appreciation / purchasePrice) * 100) : 0;

    return (
        <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center mb-2">
                        <DollarSign className="w-5 h-5 mr-2 text-emerald-400" />
                        Property Valuation
                    </h3>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                        * Based on automated valuation models (AVM). Does not replace professional appraisal.
                        Values are estimates and can vary based on market conditions.
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
                    {confidence} Confidence
                </span>
            </div>

            {/* Current Value */}
            <div className="mb-6">
                <p className="text-sm text-slate-400 mb-1">Estimated Value</p>
                <p className="text-4xl font-bold text-white">
                    ${currentValue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    Cap Rate: {capRate.toFixed(2)}%
                </p>
                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-300">
                        💡 Auto-calculated monthly from your property&apos;s NOI
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Purchase Price */}
                {purchasePrice > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <p className="text-xs text-slate-400">Purchase Price</p>
                        </div>
                        <p className="text-lg font-bold text-white">
                            ${purchasePrice.toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Cap Rate */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-400">Cap Rate</p>
                    </div>
                    <p className="text-lg font-bold text-white">
                        {capRate.toFixed(2)}%
                    </p>
                </div>

                {/* Appreciation */}
                {purchasePrice > 0 && appreciation !== 0 && (
                    <>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className={`w-4 h-4 ${appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                                <p className="text-xs text-slate-400">Total Appreciation</p>
                            </div>
                            <p className={`text-lg font-bold ${appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {appreciation >= 0 ? '+' : ''}${appreciation.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">
                                {appreciation >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}%
                            </p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className={`w-4 h-4 ${appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                                <p className="text-xs text-slate-400">Annual Rate</p>
                            </div>
                            <p className={`text-lg font-bold ${appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                It&apos;s a {Math.abs(appreciationRate)}% decrease from last year.
                            </p>
                            <p className="text-xs text-slate-500">Per year</p>
                        </div>
                    </>
                )}
            </div>

            {/* Valuation History Chart (Simple) */}
            {history.length > 1 && (
                <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-3">12-Month Trend</p>
                    <div className="flex items-end gap-1 h-16">
                        {history.map((point, index) => {
                            const maxValue = Math.max(...history.map(h => h.estimatedValue));
                            const minValue = Math.min(...history.map(h => h.estimatedValue));
                            const range = maxValue - minValue || 1;
                            const height = ((point.estimatedValue - minValue) / range) * 100;

                            return (
                                <div
                                    key={index}
                                    className="flex-1 bg-emerald-500/30 rounded-t hover:bg-emerald-500/50 transition-colors"
                                    style={{ height: `${Math.max(height, 10)}%` }}
                                    title={`$${point.estimatedValue.toLocaleString()}`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Methodology Note */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                    <strong>How it&apos;s calculated:</strong> Property Value = Annual NOI ÷ Cap Rate.
                    This uses your actual income and expenses for accurate, real-time valuation.
                </p>
            </div>
        </div>
    );
}
