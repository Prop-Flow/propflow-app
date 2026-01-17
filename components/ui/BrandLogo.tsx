'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
    variant?: 'large' | 'sidebar' | 'navbar';
    className?: string;
}

export default function BrandLogo({ variant = 'large', className }: BrandLogoProps) {
    const isLarge = variant === 'large';


    return (
        <div className={cn(
            "relative z-20 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-700",
            "flex-col gap-0",
            className
        )}>
            {/* Logo Icon */}
            <div
                className={cn(
                    "relative flex-shrink-0 transition-transform hover:scale-105 duration-300 z-10",
                    isLarge ? "h-32 w-32 ml-5 mt-2" : "h-20 w-20 ml-3 mt-1"
                )}
            >
                <Image
                    src="/propflow_logo_icon.png"
                    alt="PropFlow Logo"
                    fill
                    className="object-contain drop-shadow-xl brightness-0 invert"
                    priority
                />
            </div>

            {/* Text & Tagline */}
            <div className={cn(
                "flex flex-col relative z-20 items-center",
                isLarge ? "-mt-14" : "-mt-9"
            )}>
                <span
                    className={cn(
                        "font-bold tracking-wide text-white drop-shadow-lg leading-none",
                        isLarge ? "text-5xl" : "text-2xl"
                    )}
                    style={{ fontFamily: 'var(--font-outfit)' }}
                >
                    PropFlow
                </span>
                <span
                    className={cn(
                        "text-blue-200/90 tracking-widest uppercase font-medium mt-1",
                        isLarge ? "text-sm" : "text-[10px]"
                    )}
                >
                    Property Management
                </span>
            </div>
        </div>
    );
}
