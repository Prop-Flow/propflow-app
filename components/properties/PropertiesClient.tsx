'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users, MapPin, Plus } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import PropertyUploader from '@/components/properties/PropertyUploader';
import { ExtractedPropertyData } from '@/lib/ai/ingestion';

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
    const [isUploadMode, setUploadMode] = useState(false);

    // Derived state or handled in handleSave
    // PropertyUploader handles the parsing wizardry now.

    const handleSave = async (data: ExtractedPropertyData) => {
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
            router.refresh(); // Reload server components
        } catch (error) {
            console.error('Creation failed:', error);
            alert('Failed to create property. Please check the details and try again.');
        }
    };

    return (
        <DashboardShell role="owner">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">All Properties</h1>
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
            {initialProperties.length === 0 && !isUploadMode ? (
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
                    {initialProperties.map((property) => (
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
                        </Link>
                    ))}
                </div>
            )}


        </DashboardShell>
    );
}
