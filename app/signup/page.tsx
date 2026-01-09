'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RoleSelector from '@/components/auth/RoleSelector';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInputStrict';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';

interface AuthError {
    code?: string;
    message?: string;
}

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setIsLoading(true);
        setErrors({});

        // Validation Logic
        const newErrors: { [key: string]: string } = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        // Simplified complexity check for MVP pivot
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

        try {
            console.log(`[Signup] Creating user ${formData.email} as ${role}`);

            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Update Profile (DisplayName)
            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            // 3. Create Firestore Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                role: role.toUpperCase(), // Store as normalized uppercase
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            console.log('[Signup] User created and profile saved.');

            // 4. Redirect
            const targetPath = role === 'tenant' ? '/dashboard/tenant' : role === 'manager' ? '/dashboard/manager' : '/dashboard/owner';
            router.push(targetPath);

        } catch (error: unknown) {
            console.error('Signup error:', error);
            const authError = error as AuthError;
            let msg = 'Registration failed. Please check your inputs.';
            if (authError.code === 'auth/email-already-in-use') {
                msg = 'Email is already in use.';
            }
            // Add more firebase error codes as needed
            setErrors(prev => ({ ...prev, email: msg })); // Attach general error to email or show alert
            alert(msg); // Fallback for general errors
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout maxWidth="max-w-2xl">
            <div className="w-full bg-card/40 backdrop-blur-2xl border border-white/20 p-8 py-10 rounded-3xl shadow-2xl relative overflow-hidden group">
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                error={errors.firstName}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                error={errors.lastName}
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            required
                            error={errors.email}
                        />

                        <PhoneInput
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(value: string) => setFormData({ ...formData, phone: value })}
                            required
                            error={errors.phone}
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                required
                                error={errors.password}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-muted-foreground hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                error={errors.confirmPassword}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[38px] text-muted-foreground hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

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
        </AuthLayout>
    );
}
