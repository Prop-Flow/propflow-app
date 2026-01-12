"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userRegisterSchema } from '@/lib/validations/auth';
import BrandLogo from '@/components/ui/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Building2, User, Key, ArrowRight } from 'lucide-react';

function TenantOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Steps: 1 = Code Entry, 2 = Registration Form, 3 = Success
    const [step, setStep] = useState(1);

    // Form State
    const [buildingCode, setBuildingCode] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        apartmentNumber: '',
        occupants: 1
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-fill code from URL
    useEffect(() => {
        const codeFromUrl = searchParams?.get('code');
        if (codeFromUrl && step === 1) {
            setBuildingCode(codeFromUrl);
            // Optionally auto-submit if you want valid-checking right away
            // validCode(codeFromUrl); 
        }
    }, [searchParams, step]);

    const handleValidateCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!buildingCode.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/properties/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: buildingCode })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Invalid building code. Please check and try again.');
            } else {
                setProperty(data.property);
                setStep(2);
            }
        } catch {
            setError('Unable to verify code. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Client-side Zod Validation
        const validation = userRegisterSchema.safeParse({
            propertyId: property.id,
            ...formData,
            occupants: Number(formData.occupants)
        });

        if (!validation.success) {
            const firstError = validation.error.errors[0].message;
            setError(firstError);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/tenants/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validation.data)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed. Please try again.');
            } else {
                setStep(3);
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 z-10 relative">
                <div className="flex justify-center mb-8">
                    <BrandLogo />
                </div>

                <AnimatePresence mode='wait'>
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-900">Welcome Home</h2>
                                <p className="text-slate-500 mt-2 text-sm">Enter your building code to get started.</p>
                            </div>

                            <form onSubmit={handleValidateCode} className="space-y-4">
                                <div>
                                    <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                                        Building Code
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        </div>
                                        <input
                                            id="code"
                                            type="text"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                            placeholder="e.g. PROP-1234"
                                            value={buildingCode}
                                            onChange={(e) => setBuildingCode(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
                                    >
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/10 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && property && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Property Found</p>
                                    <p className="font-bold text-slate-900">{property.name}</p>
                                    <p className="text-sm text-slate-600">{property.address}</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Unit / Apt #</label>
                                        <input
                                            type="text"
                                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                            value={formData.apartmentNumber}
                                            onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Occupants</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type="number"
                                                min="1"
                                                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                                value={formData.occupants}
                                                onChange={(e) => setFormData({ ...formData, occupants: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-600 text-sm bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-2"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="pt-2 flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/10 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Registration'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Go back
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h3>
                            <p className="text-slate-500 mb-8 max-w-[280px] mx-auto">
                                Your account has been created. We&apos;ve notified the property manager for final approval.
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                                Return Home
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function TenantOnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <TenantOnboardingContent />
        </Suspense>
    );
}
