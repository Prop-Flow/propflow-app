'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const router = useRouter();

    // Clear any potential Developer Mode artifacts on mount
    useEffect(() => {
        // Clear cookies
        document.cookie = "propflow_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "propflow_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Clear localStorage
        localStorage.removeItem('propflow_user');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setErrors({});

        const { email, password } = formData;
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const result = await signIn('credentials', {
                email: email.trim(),
                password: password.trim(),
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials');
                setLoading(false);
            } else {
                // Successful login - fetch user role to determine redirect
                try {
                    const response = await fetch('/api/user/me');
                    const userData = await response.json();

                    if (userData.role === 'OWNER') {
                        router.push('/dashboard/owner');
                    } else if (userData.role === 'PROPERTY_MANAGER') {
                        router.push('/dashboard/manager');
                    } else {
                        router.push('/dashboard/tenant/maintenance');
                    }
                } catch (err) {
                    console.error('Error fetching user role:', err);
                    // Fallback to owner dashboard
                    router.push('/dashboard/owner');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your credentials to access your dashboard.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" noValidate>
                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        error={errors.email}
                    />

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                            <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="mt-0"
                            error={errors.password}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-all mt-6 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </div>


            </div>


        </AuthLayout >
    );
}
