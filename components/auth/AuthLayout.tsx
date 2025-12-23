'use client';
import React from 'react';
import Link from 'next/link';
import ReactiveBackground from '@/components/ui/ReactiveBackground';
import BrandLogo from '@/components/ui/BrandLogo';

export default function AuthLayout({
    children,
    maxWidth = "max-w-md"
}: {
    children: React.ReactNode;
    maxWidth?: string;
}) {
    return (
        <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            {/* Reactive Background Gradient */}
            <ReactiveBackground />

            {/* Stacked Branding (Dashboard Style - Large) */}
            <BrandLogo variant="large" className="mb-8" />

            <div className={`relative z-10 w-full ${maxWidth}`}>
                {children}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl opacity-50 pointer-events-none" />

            {/* Developer Access Link (Hidden in plain sight) */}
            <Link
                href="/dev-login"
                className="absolute bottom-4 right-4 p-2 opacity-10 hover:opacity-100 transition-opacity bg-white/10 rounded-lg text-[10px] text-white/50 font-bold uppercase tracking-widest z-[100]"
            >
                Dev Access
            </Link>
        </div>
    );
}
