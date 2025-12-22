'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users, MapPin, Plus, Activity, Loader2 } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import PropertyUploader, { WizardData } from '@/components/properties/PropertyUploader';
import { useAuth } from '@/hooks/useAuth';

interface Property {
    id: string;
    name: string;
    type: string | null;
    address: string;
    _count: {
        tenants: number;
        complianceItems: number;
    };
}

interface PropertiesClientProps {
    initialProperties: Property[];
}

export default function PropertiesClient({ initialProperties }: PropertiesClientProps) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [loading, setLoading] = useState(initialProperties.length === 0);
    const [isUploadMode, setUploadMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialProperties.length === 0) {
            fetch('/api/properties')
                .then(async res => {
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to load properties');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.properties) {
                        setProperties(data.properties);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch properties", err);
                    setError(err.message || 'Unable to load properties. Please try again.');
                    setLoading(false);
                });
        }
    }, [initialProperties.length]);

    const handleSave = async (data: WizardData) => {
        try {
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to create property');
            }

            // Reset state and refresh list
            setUploadMode(false);
            setLoading(true); // Show loading state while refreshing
            const res = await fetch('/api/properties');
            const newData = await res.json();
            setProperties(newData.properties || []);
            setLoading(false);
        } catch (error) {
            console.error('Creation failed:', error);
            alert('Failed to create property. Please check the details and try again.');
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const currentRole = (user?.role === 'property_manager' ? 'manager' : user?.role as "tenant" | "owner" | "manager") || 'owner';

    if (error) {
        return (
            <DashboardShell role={currentRole}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-8 max-w-md">
                        <p className="text-red-400 text-center mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell role={currentRole}>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    {currentRole === 'manager' ? 'Managed Properties' : 'All Properties'}
                </h1>
                {!isUploadMode && (
                    <button
                        onClick={() => setUploadMode(true)}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Property
                    </button>
                )}
            </div>

            {/* Smart Ingestion Flow */}
            {isUploadMode && (
                <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add New Property</h2>
                            <button
                                onClick={() => setUploadMode(false)}
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        <PropertyUploader
                            onAnalysisComplete={handleSave}
                        />
                    </div>
                </div>
            )}

            {/* Property List */}
            {properties.length === 0 && !isUploadMode ? (
                <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-dashed border-white/10 p-12 text-center">
                    <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No properties yet</h3>
                    <p className="text-muted-foreground mb-6">Get started by adding your first property</p>
                    <button
                        onClick={() => setUploadMode(true)}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                        Add Your First Property
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <Link
                            key={property.id}
                            href={`/properties/${property.id}`}
                            className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded">
                                    {property.type || 'Residential'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {property.name}
                            </h3>

                            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{property.address}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {property._count.tenants} {property._count.tenants === 1 ? 'tenant' : 'tenants'}
                                    </span>
                                </div>
                                {property._count.complianceItems > 0 && (
                                    <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                                        {property._count.complianceItems} pending
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/dashboard/owner/utilities?propertyId=${property.id}`);
                                    }}
                                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer"
                                >
                                    <Activity className="w-3 h-3" />
                                    View Utilities
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}


        </DashboardShell>
    );
}
