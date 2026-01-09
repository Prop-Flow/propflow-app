/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Building2, MapPin, User, DollarSign, AlertCircle } from 'lucide-react';
import { ExtractedPropertyData } from '@/lib/ai/document-parser';

interface PropertyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ExtractedPropertyData) => void;
    data: ExtractedPropertyData;
}

export default function PropertyReviewModal({ isOpen, onClose, onSave, data }: PropertyReviewModalProps) {
    const [formData, setFormData] = useState<ExtractedPropertyData>(data);
    const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'property' | 'owner' | 'financials'>('property');

    useEffect(() => {
        setFormData(data);
        setVerifiedFields(new Set());
    }, [data]);

    if (!isOpen) return null;

    const handleVerify = (fieldPath: string) => {
        const next = new Set(verifiedFields);
        if (next.has(fieldPath)) next.delete(fieldPath);
        else next.add(fieldPath);
        setVerifiedFields(next);
    };

    const handleChange = (section: keyof ExtractedPropertyData, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(prev[section] as any),
                [field]: value
            }
        }));
    };

    // Critical fields that must be verified before saving
    const requiredFields = ['property.address', 'owner.legalName1'];
    // Check if all required fields are verified
    const canSave = requiredFields.every(f => verifiedFields.has(f));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-white">Review Property Data</h2>
                        <p className="text-sm text-slate-400">Verify extracted details from your document.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <TabButton active={activeTab === 'property'} onClick={() => setActiveTab('property')} icon={Building2} label="Property" />
                    <TabButton active={activeTab === 'owner'} onClick={() => setActiveTab('owner')} icon={User} label="Owner" />
                    <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={DollarSign} label="Financials" />
                </div>

                {/* Validation Banner */}
                {!canSave && (
                    <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-3 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-200">Missing Required Information</p>
                            <p className="text-xs text-orange-200/70 mt-1">
                                To proceed, please verify:
                                {!verifiedFields.has('property.address') && <span className="font-bold ml-1 text-orange-100">• Property Address</span>}
                                {!verifiedFields.has('owner.legalName1') && <span className="font-bold ml-1 text-orange-100">• Owner Legal Name</span>}
                            </p>
                            <p className="text-xs text-orange-200/50 mt-1 italic">
                                * These are essential for generating accurate legal documents.
                            </p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-black/20">
                    {activeTab === 'property' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <SectionHeader icon={Building2} title="Property Specification" />
                            <div className="grid gap-4">
                                <ReviewField
                                    label="Full Address"
                                    value={formData.property?.address || ''}
                                    path="property.address"
                                    isVerified={verifiedFields.has('property.address')}
                                    onVerify={() => handleVerify('property.address')}
                                    onChange={(v) => handleChange('property', 'address', v)}
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <ReviewField
                                        label="Type"
                                        value={formData.property?.type || ''}
                                        path="property.type"
                                        isVerified={verifiedFields.has('property.type')}
                                        onVerify={() => handleVerify('property.type')}
                                        onChange={(v) => handleChange('property', 'type', v)}
                                    />
                                    <ReviewField
                                        label="Upgrades / Features"
                                        value={formData.property?.upgrades || ''}
                                        path="property.upgrades"
                                        isVerified={verifiedFields.has('property.upgrades')}
                                        onVerify={() => handleVerify('property.upgrades')}
                                        onChange={(v) => handleChange('property', 'upgrades', v)}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <ReviewField
                                        label="Beds"
                                        value={formData.property?.beds || ''}
                                        path="property.beds"
                                        isVerified={verifiedFields.has('property.beds')}
                                        onVerify={() => handleVerify('property.beds')}
                                        onChange={(v) => handleChange('property', 'beds', Number(v))}
                                        type="number"
                                    />
                                    <ReviewField
                                        label="Baths"
                                        value={formData.property?.baths || ''}
                                        path="property.baths"
                                        isVerified={verifiedFields.has('property.baths')}
                                        onVerify={() => handleVerify('property.baths')}
                                        onChange={(v) => handleChange('property', 'baths', Number(v))}
                                        type="number"
                                    />
                                    <ReviewField
                                        label="Garage Spaces"
                                        value={formData.property?.garageSpaces || ''}
                                        path="property.garageSpaces"
                                        isVerified={verifiedFields.has('property.garageSpaces')}
                                        onVerify={() => handleVerify('property.garageSpaces')}
                                        onChange={(v) => handleChange('property', 'garageSpaces', Number(v))}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'owner' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <SectionHeader icon={User} title="Ownership Information" />
                            <div className="grid gap-4">
                                <ReviewField
                                    label="Primary Legal Name"
                                    value={formData.owner?.legalName1 || ''}
                                    path="owner.legalName1"
                                    isVerified={verifiedFields.has('owner.legalName1')}
                                    onVerify={() => handleVerify('owner.legalName1')}
                                    onChange={(v) => handleChange('owner', 'legalName1', v)}
                                    required
                                />
                                <ReviewField
                                    label="Secondary Legal Name"
                                    value={formData.owner?.legalName2 || ''}
                                    path="owner.legalName2"
                                    isVerified={verifiedFields.has('owner.legalName2')}
                                    onVerify={() => handleVerify('owner.legalName2')}
                                    onChange={(v) => handleChange('owner', 'legalName2', v)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <ReviewField
                                        label="Email"
                                        value={formData.owner?.email || ''}
                                        path="owner.email"
                                        isVerified={verifiedFields.has('owner.email')}
                                        onVerify={() => handleVerify('owner.email')}
                                        onChange={(v) => handleChange('owner', 'email', v)}
                                        type="email"
                                    />
                                    <ReviewField
                                        label="Phone"
                                        value={formData.owner?.phone || ''}
                                        path="owner.phone"
                                        isVerified={verifiedFields.has('owner.phone')}
                                        onVerify={() => handleVerify('owner.phone')}
                                        onChange={(v) => handleChange('owner', 'phone', v)}
                                        type="tel"
                                    />
                                </div>
                                <ReviewField
                                    label="Mailing Address"
                                    value={formData.owner?.mailingAddress || ''}
                                    path="owner.mailingAddress"
                                    isVerified={verifiedFields.has('owner.mailingAddress')}
                                    onVerify={() => handleVerify('owner.mailingAddress')}
                                    onChange={(v) => handleChange('owner', 'mailingAddress', v)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <SectionHeader icon={DollarSign} title="Financial Details" />
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <ReviewField
                                        label="List Price"
                                        value={formData.financials?.listPrice || ''}
                                        path="financials.listPrice"
                                        isVerified={verifiedFields.has('financials.listPrice')}
                                        onVerify={() => handleVerify('financials.listPrice')}
                                        onChange={(v) => handleChange('financials', 'listPrice', Number(v))}
                                        type="number"
                                        icon={<span className="text-slate-400 font-bold">$</span>}
                                    />
                                    <ReviewField
                                        label="Monthly HOA Fee"
                                        value={formData.financials?.hoaFee || ''}
                                        path="financials.hoaFee"
                                        isVerified={verifiedFields.has('financials.hoaFee')}
                                        onVerify={() => handleVerify('financials.hoaFee')}
                                        onChange={(v) => handleChange('financials', 'hoaFee', Number(v))}
                                        type="number"
                                        icon={<span className="text-slate-400 font-bold">$</span>}
                                    />
                                </div>
                                <ReviewField
                                    label="Annual Tax Amount"
                                    value={formData.financials?.taxAmount || ''}
                                    path="financials.taxAmount"
                                    isVerified={verifiedFields.has('financials.taxAmount')}
                                    onVerify={() => handleVerify('financials.taxAmount')}
                                    onChange={(v) => handleChange('financials', 'taxAmount', Number(v))}
                                    type="number"
                                    icon={<span className="text-slate-400 font-bold">$</span>}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                        {verifiedFields.size} fields verified
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            disabled={!canSave}
                            className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-sm flex items-center gap-2
                                ${canSave
                                    ? 'bg-blue-600 hover:bg-blue-700 translate-y-0'
                                    : 'bg-slate-700 cursor-not-allowed text-slate-400'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            Confirm & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


function SectionHeader({ icon: Icon, title }: { icon: React.ElementType, title: string }) {
    return (
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 pb-2 mb-2 border-b border-white/10">
            <Icon className="w-4 h-4 text-blue-400" /> {title}
        </h3>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative
                ${active ? 'text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
            <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
        </button>
    );
}


interface ReviewFieldProps {
    label: string;
    value: string | number;
    path: string;
    isVerified: boolean;
    onVerify: () => void;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
}

function ReviewField({ label, value, isVerified, onVerify, onChange, type = 'text', placeholder, icon, required }: ReviewFieldProps) {
    return (
        <div className={`relative group transition-all duration-200`}>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative flex items-center">
                <div className="relative flex-1">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-800/80 border rounded-lg text-white text-sm transition-all focus:outline-none focus:ring-2
                            ${isVerified
                                ? 'border-green-500/50 bg-green-500/10 focus:border-green-500 focus:ring-green-500/20'
                                : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                    />
                </div>

                <button
                    onClick={onVerify}
                    className={`ml-3 p-2 rounded-full border transition-all duration-200
                        ${isVerified
                            ? 'bg-green-600 border-green-600 text-white shadow-sm scale-110'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-white'
                        }`}
                    title={isVerified ? "Verified" : "Click to verify"}
                >
                    <Check className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
