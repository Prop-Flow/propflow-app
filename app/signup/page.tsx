'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import RoleSelector from '@/components/auth/RoleSelector';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInputStrict';
import { cn } from '@/lib/utils';


import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/auth';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'tenant' | 'owner' | 'manager' | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Clear any potential Developer Mode artifacts on mount
    React.useEffect(() => {
        // Clear cookies
        document.cookie = "propflow_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "propflow_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Clear localStorage
        localStorage.removeItem('propflow_user');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setIsLoading(true);
        setErrors({});

        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 7) {
            newErrors.phone = 'Phone number is too short';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        const formDataPayload = new FormData();
        formDataPayload.append('firstName', formData.firstName);
        formDataPayload.append('lastName', formData.lastName);
        formDataPayload.append('email', formData.email);
        formDataPayload.append('password', formData.password);
        formDataPayload.append('role', role);
        formDataPayload.append('phone', formData.phone);

        try {
            // Call server action
            const result = await registerUser({}, formDataPayload);

            if (result.success) {
                // CRITICAL: Clear ALL developer mode artifacts before auto-login
                document.cookie = "propflow_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "propflow_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                localStorage.removeItem('propflow_user');
                sessionStorage.clear();

                // Auto login after success
                const loginResult = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (loginResult?.error) {
                    console.error('Login failed after registration:', loginResult.error);
                    // Fallback to login page
                    router.push('/login');
                } else {
                    const targetPath = role === 'tenant' ? '/dashboard/tenant' : role === 'manager' ? '/dashboard/manager' : '/dashboard/owner';
                    router.push(targetPath);
                }
            } else {
                console.error('Registration failed result:', result);
                console.error('Registration failed errors:', result.errors);
                console.error('Registration failed message:', result.message);
                alert(result.message || 'Registration failed. Please check your inputs.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout maxWidth="max-w-2xl">
            <div className="w-full bg-card/40 backdrop-blur-2xl border border-white/20 p-8 py-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm group-hover:via-primary/80 transition-all duration-500" />

                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                        Create an Account
                    </h1>
                    <p className="text-base text-muted-foreground font-medium">
                        The AI-Powered Operating System for Modern Real Estate.
                    </p>
                </div>

                <RoleSelector role={role} onSelect={setRole} />

                {role && (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" noValidate>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                error={errors.firstName}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                error={errors.lastName}
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            error={errors.email}
                        />

                        <PhoneInput
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            required
                            error={errors.phone}
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            error={errors.password}
                        />

                        <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            error={errors.confirmPassword}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-all mt-8 flex items-center justify-center shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
                                isLoading && "opacity-80 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                `Sign Up as ${role === 'tenant' ? 'Tenant' : role === 'manager' ? 'Property Manager' : 'Owner'}`
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Log in
                    </Link>
                </div>
            </div>

            {/* Feature Shuffle / Showcase Placeholder below */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Modern Security</span>
                    <span>•</span>
                    <span>Real-time Analytics</span>
                    <span>•</span>
                    <span>AI Insights</span>
                </div>
            </div>
        </AuthLayout>
    );
}
