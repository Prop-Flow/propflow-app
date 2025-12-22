"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userRegisterSchema } from '@/lib/validations/auth';

export default function TenantOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
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

    const handleValidateCode = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setError(data.error || 'Invalid code');
            } else {
                setProperty(data.property);
                setStep(2);
            }
        } catch {
            setError('Failed to validate code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ... existing imports

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Client-side Zod Validation
        const validation = userRegisterSchema.safeParse({
            propertyId: property.id,
            ...formData,
            occupants: Number(formData.occupants) // Ensure number type
        });

        if (!validation.success) {
            const firstError = validation.error.errors[0].message;
            setError(firstError);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register-tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validation.data) // Send validated data
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
            } else {
                setStep(3);
            }
        } catch {
            setError('Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Tenant Registration
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Connect with your property management
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {step === 1 && (
                        <form onSubmit={handleValidateCode} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Building Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Enter code provided by owner"
                                        value={buildingCode}
                                        onChange={(e) => setBuildingCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <div className="text-red-600 text-sm">{error}</div>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Next'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && property && (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-md mb-4">
                                <p className="text-sm text-indigo-700">Property Found:</p>
                                <p className="font-semibold text-indigo-900">{property.name}</p>
                                <p className="text-xs text-indigo-700">{property.address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit / Apt #</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.apartmentNumber}
                                        onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Occupants</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.occupants}
                                        onChange={(e) => setFormData({ ...formData, occupants: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {error && <div className="text-red-600 text-sm">{error}</div>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Registering...' : 'Register'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mt-2 w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    Back
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Registration Successful!</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Your account has been created and is pending approval by the property manager.
                                You will receive an email once approved.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
