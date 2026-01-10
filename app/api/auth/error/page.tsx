'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
    return (
        <AuthLayout maxWidth="max-w-md">
            <div className="w-full bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
                <p className="text-muted-foreground mb-8">
                    There was a problem signing you in. This could be due to missing configuration or an expired session.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-md transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Error Code: AUTH_MIGRATION_ERROR
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
