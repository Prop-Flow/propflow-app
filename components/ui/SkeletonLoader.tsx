'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    count = 1,
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-white/10';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseClasses, variantClasses[variant], className)}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    );
}

// Common skeleton patterns
export function CardSkeleton() {
    return (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <div className="flex items-start justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton width={60} height={24} />
            </div>
            <Skeleton width="80%" height={24} className="mb-2" />
            <Skeleton width="60%" height={16} className="mb-4" />
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Skeleton width={80} height={16} />
                <Skeleton width={100} height={32} />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="60%" height={16} />
                </div>
            </div>
            <Skeleton width={80} height={32} />
        </div>
    );
}

export function DashboardStatSkeleton() {
    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
                <Skeleton variant="circular" width={48} height={48} />
            </div>
            <Skeleton width={80} height={36} className="mb-2" />
            <Skeleton width="60%" height={16} />
        </div>
    );
}
