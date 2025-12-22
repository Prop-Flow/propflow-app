'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';

interface LeaseOptimizationPanelProps {
    optimization: {
        id: string;
        currentRent: number;
        recommendedRent: number;
        changeAmount: number;
        changePercent: number;
        marketPosition: 'above_market' | 'at_market' | 'below_market';
        confidence: 'HIGH' | 'MEDIUM' | 'LOW';
        reasoning: string[];
        insights: Array<{
            type: 'opportunity' | 'warning' | 'neutral';
            title: string;
            description: string;
            impact: 'high' | 'medium' | 'low';
        }>;
        status: string;
    };
    comparables?: Array<{
        address: string;
        distance: number;
        rentAmount: number;
        bedrooms: number;
        squareFeet: number;
    }>;
    onApprove?: (optimizationId: string) => Promise<void>;
    onReject?: (optimizationId: string) => Promise<void>;
}

export function LeaseOptimizationPanel({
    optimization,
    comparables = [],
    onApprove,
    onReject
}: LeaseOptimizationPanelProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const isIncrease = optimization.changeAmount > 0;

    const handleApprove = async () => {
        if (!onApprove) return;
        setIsProcessing(true);
        try {
            await onApprove(optimization.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!onReject) return;
        setIsProcessing(true);
        try {
            await onReject(optimization.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'HIGH':
                return 'text-green-500 bg-green-500/10';
            case 'MEDIUM':
                return 'text-yellow-500 bg-yellow-500/10';
            case 'LOW':
                return 'text-red-500 bg-red-500/10';
            default:
                return 'text-muted-foreground bg-muted';
        }
    };

    const getMarketPositionBadge = (position: string) => {
        switch (position) {
            case 'above_market':
                return <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500">Above Market</span>;
            case 'at_market':
                return <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">At Market</span>;
            case 'below_market':
                return <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">Below Market</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header - Review and Approve Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1">AI Pricing Recommendation</h3>
                        <div className="flex items-center gap-2">
                            {getMarketPositionBadge(optimization.marketPosition)}
                            <span className={`text-xs px-2 py-1 rounded font-medium ${getConfidenceColor(optimization.confidence)}`}>
                                {optimization.confidence} Confidence
                            </span>
                        </div>
                    </div>
                </div>

                {/* Current vs Recommended */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Current Rent</p>
                        <p className="text-3xl font-bold">${optimization.currentRent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">per month</p>
                    </div>
                    <div className="bg-background rounded-lg p-4 border-2 border-primary">
                        <p className="text-xs text-primary mb-1">Recommended Rent</p>
                        <p className="text-3xl font-bold text-primary">${optimization.recommendedRent.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isIncrease ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <p className={`text-sm font-medium ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {isIncrease ? '+' : ''}{optimization.changePercent.toFixed(1)}% (${Math.abs(optimization.changeAmount).toLocaleString()})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Impact Projection */}
                <div className="bg-background rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-2">Financial Impact</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Monthly Change</p>
                            <p className={`font-semibold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {isIncrease ? '+' : ''}${Math.abs(optimization.changeAmount).toLocaleString()}/mo
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Annual Impact</p>
                            <p className={`font-semibold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {isIncrease ? '+' : ''}${Math.abs(optimization.changeAmount * 12).toLocaleString()}/yr
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {optimization.status === 'pending' && onApprove && onReject && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {isProcessing ? 'Processing...' : 'Approve & Apply'}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            Reject
                        </button>
                    </div>
                )}
            </div>

            {/* AI Reasoning Panel */}
            <div className="bg-secondary rounded-lg p-6 border border-border">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    AI Reasoning
                </h4>
                <div className="space-y-3">
                    {optimization.reasoning.map((reason, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                            </div>
                            <p className="text-sm text-foreground flex-1">{reason}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Market Insights */}
            {optimization.insights.length > 0 && (
                <div className="bg-secondary rounded-lg p-6 border border-border">
                    <h4 className="text-lg font-semibold mb-4">Market Insights</h4>
                    <div className="space-y-3">
                        {optimization.insights.map((insight, index) => {
                            const Icon = insight.type === 'opportunity' ? TrendingUp : insight.type === 'warning' ? AlertCircle : Lightbulb;
                            const colorClass = insight.type === 'opportunity' ? 'text-green-500 bg-green-500/10' : insight.type === 'warning' ? 'text-yellow-500 bg-yellow-500/10' : 'text-blue-500 bg-blue-500/10';

                            return (
                                <div key={index} className={`p-4 rounded-lg ${colorClass}`}>
                                    <div className="flex items-start gap-3">
                                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm mb-1">{insight.title}</p>
                                            <p className="text-sm opacity-90">{insight.description}</p>
                                            <span className="text-xs opacity-75 mt-1 inline-block">
                                                Impact: {insight.impact.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Comparable Properties */}
            {comparables.length > 0 && (
                <div className="bg-secondary rounded-lg p-6 border border-border">
                    <h4 className="text-lg font-semibold mb-4">Nearby Comparable Properties</h4>
                    <div className="space-y-2">
                        {comparables.slice(0, 3).map((comp, index) => (
                            <div key={index} className="bg-background rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{comp.address}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {comp.bedrooms}bd • {comp.squareFeet.toLocaleString()}sqft • {comp.distance}mi away
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${comp.rentAmount.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">per month</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
