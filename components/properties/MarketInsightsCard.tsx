'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Home, Calendar } from 'lucide-react';

interface MarketInsightsCardProps {
    zipCode: string;
    currentMedianRent: number;
    growthVelocity: number;
    vacancyRate: number;
    daysOnMarket: number;
    trends12Month: Array<{
        month: string;
        medianRent: number;
    }>;
}

export function MarketInsightsCard({
    zipCode,
    currentMedianRent,
    growthVelocity,
    vacancyRate,
    daysOnMarket,
    trends12Month
}: MarketInsightsCardProps) {
    const isGrowthPositive = growthVelocity > 0;
    const isVacancyLow = vacancyRate < 5;

    return (
        <div className="bg-secondary rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Market Intelligence</h3>
                <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    ZIP: {zipCode}
                </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Median Rent */}
                <div className="bg-background rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Median Rent</span>
                    </div>
                    <p className="text-2xl font-bold">${currentMedianRent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>

                {/* Growth Velocity */}
                <div className="bg-background rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        {isGrowthPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">Growth Rate</span>
                    </div>
                    <p className={`text-2xl font-bold ${isGrowthPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {growthVelocity > 0 ? '+' : ''}{growthVelocity.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">annually</p>
                </div>

                {/* Vacancy Rate */}
                <div className="bg-background rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Vacancy Rate</span>
                    </div>
                    <p className={`text-2xl font-bold ${isVacancyLow ? 'text-green-500' : 'text-yellow-500'}`}>
                        {vacancyRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isVacancyLow ? 'Low - High demand' : 'Moderate'}
                    </p>
                </div>

                {/* Days on Market */}
                <div className="bg-background rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Avg. Days Listed</span>
                    </div>
                    <p className="text-2xl font-bold">{daysOnMarket}</p>
                    <p className="text-xs text-muted-foreground mt-1">days</p>
                </div>
            </div>

            {/* 12-Month Trend Chart (Simple Bar Chart) */}
            <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">12-Month Rent Trend</h4>
                <div className="flex items-end gap-1 h-32">
                    {trends12Month.map((trend, index) => {
                        const maxRent = Math.max(...trends12Month.map(t => t.medianRent));
                        const height = (trend.medianRent / maxRent) * 100;
                        const isRecent = index >= trends12Month.length - 3;

                        return (
                            <div key={trend.month} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className={`w-full rounded-t transition-all ${isRecent ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    style={{ height: `${height}%` }}
                                    title={`${trend.month}: $${trend.medianRent}`}
                                />
                                {index % 3 === 0 && (
                                    <span className="text-[8px] text-muted-foreground">
                                        {trend.month.split('-')[1]}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Market Summary */}
            <div className="mt-6 p-4 bg-background rounded-lg border-l-4 border-primary">
                <p className="text-sm">
                    {isGrowthPositive ? (
                        <>
                            <span className="font-semibold text-green-500">Strong market growth</span> of{' '}
                            {growthVelocity.toFixed(1)}% annually supports rent increases.
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-yellow-500">Flat market</span> suggests focus on
                            tenant retention.
                        </>
                    )}
                    {' '}
                    {isVacancyLow ? (
                        <>Low vacancy indicates high demand.</>
                    ) : (
                        <>Moderate vacancy suggests competitive pricing needed.</>
                    )}
                </p>
            </div>
        </div>
    );
}
