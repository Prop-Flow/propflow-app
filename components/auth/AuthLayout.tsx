'use client';
import React from 'react';
import Image from 'next/image';
import ReactiveBackground from '@/components/ui/ReactiveBackground';

export default function AuthLayout({
    children,
    maxWidth = "max-w-md"
}: {
    children: React.ReactNode;
    maxWidth?: string;
}) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center">
            {/* Reactive Background Gradient */}
            <ReactiveBackground />

            {/* Centered Branding (Dashboard Style) */}
            <div className="relative z-20 flex flex-col items-center justify-center gap-0 mb-8 -mt-36 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="relative h-32 w-32 flex-shrink-0 transition-transform hover:scale-105 duration-300 z-10">
                    <Image
                        src="/propflow_logo_new.png"
                        alt="PropFlow Logo"
                        fill
                        className="object-contain brightness-0 invert drop-shadow-xl"
                        priority
                    />
                </div>
                <div className="flex flex-col items-center -mt-8 relative z-20">
                    <span className="text-5xl font-bold tracking-wide text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-outfit)' }}>
                        PropFlow
                    </span>
                    <span className="text-sm text-blue-200/90 tracking-widest uppercase font-medium mt-1">
                        Property Management
                    </span>
                </div>
            </div>

            <div className={`relative z-10 w-full ${maxWidth} px-4`}>
                {children}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl opacity-50 pointer-events-none" />
        </div>
    );
}
