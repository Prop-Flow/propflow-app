'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function DevLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDevLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password === 'Sharktank101!') {
            try {
                // Real Auth
                await signInWithEmailAndPassword(auth, 'dev@propflow.ai', 'Sharktank101!');
                router.push('/dashboard/owner');
            } catch (err) {
                console.error('Dev auth failed:', err);
                setError('Dev Auth Failed (Check Console)');
                setIsLoading(false);
            }
        } else {
            setError('Invalid Developer Password');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout maxWidth="max-w-md">
            <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 py-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm group-hover:via-blue-500/80 transition-all duration-500" />

                <div className="text-center mb-8 space-y-3">
                    <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-2">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Developer Access</h1>
                    <p className="text-slate-400 text-sm font-medium">Please enter the security key to bypass authentication systems.</p>
                </div>

                <form onSubmit={handleDevLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="Security Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg font-medium"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-xs font-bold uppercase tracking-widest pl-1 pt-1 animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Authenticate
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full text-center text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mt-2"
                    >
                        Return to Public Login
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-[0.2em]">Dev Environment Protocol Active</span>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
