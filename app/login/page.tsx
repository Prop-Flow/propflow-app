'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';

interface AuthError {
    code?: string;
    message?: string;
}

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const [devMode, setDevMode] = useState(false);

    // Clear email when entering Dev Mode
    useEffect(() => {
        if (devMode) {
            setFormData(prev => ({ ...prev, email: '' }));
        }
    }, [devMode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setErrors({});

        const { email, password } = formData;
        const newErrors: { email?: string; password?: string } = {};

        if (!devMode) {
            if (!email) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                newErrors.email = 'Invalid email address';
            }
        }

        if (!password) {
            newErrors.password = devMode ? 'Security key is required' : 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const loginEmail = devMode ? 'dev@propflow.ai' : email.trim();
            const loginPassword = password.trim();
            console.log(`[Login] Attempting sign-in for ${loginEmail} (DevMode: ${devMode})`);

            // Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;
            console.log('[Login] Firebase Auth Successful:', user.uid);

            // Redirect
            router.push('/dashboard');

        } catch (err: unknown) {
            console.error('Login error:', err);
            let msg = 'An error occurred during login';
            const authError = err as AuthError;
            if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                msg = devMode ? 'Invalid security key' : 'Invalid credentials';
            }
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl relative overflow-hidden">
                {devMode && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {devMode ? 'Developer Access' : 'Welcome back'}
                    </h1>
                    <p className="text-muted-foreground">
                        {devMode ? 'Enter security key to bypass authentication' : 'Enter your credentials to access your dashboard.'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">v2.0.firebase-core</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" noValidate>
                    {!devMode ? (
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            required
                            error={errors.email}
                            className="bg-white/5 border-white/10"
                        />
                    ) : (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">
                                Developer Email (Fixed)
                            </label>
                            <div className="h-12 w-full bg-white/5 border border-white/10 rounded-md flex items-center px-4 text-white/50 font-mono text-sm cursor-not-allowed">
                                dev@propflow.ai
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-muted-foreground ml-1">
                                {devMode ? 'Security Key' : 'Password'}
                            </label>
                            {!devMode && <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>}
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={devMode ? "••••••••" : "••••••••"}
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className={`mt-0 bg-white/5 border-white/10 pr-10 ${devMode ? 'text-lg font-mono tracking-widest' : ''}`}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-12 text-white font-bold rounded-md transition-all mt-6 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${devMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {devMode ? 'Authenticating...' : 'Sign In...'}
                            </span>
                        ) : (
                            devMode ? "Authenticate" : "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>

                    <div className="w-full pt-6 border-t border-white/5 flex justify-center">
                        <button
                            onClick={() => setDevMode(!devMode)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${devMode ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`} />
                            {devMode ? 'Exit Dev Mode' : 'Enter Dev Mode'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthLayout >
    );
}
