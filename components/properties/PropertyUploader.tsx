import React, { useCallback, useState } from 'react';
import { FileText, CheckCircle, Loader2, BookOpen, User, AlertCircle, X } from 'lucide-react';
import { ExtractedPropertyData, ExtractedTenantData, RentRollData } from '@/lib/ai/document-parser';
import PropertyReviewModal from './PropertyReviewModal';
import RentRollReviewModal from './RentRollReviewModal';

export interface WizardData extends ExtractedPropertyData {
    tenant?: ExtractedTenantData;
    rentRollUnits?: RentRollData['units'];
}

interface PropertyUploaderProps {
    onAnalysisComplete: (data: WizardData) => void;
    initialStep?: Step;
}

type Step = 'upload-property-doc' | 'analyzing-doc' | 'review-deed' | 'analyzing-rent-roll' | 'review-rent-roll' | 'occupancy-check' | 'upload-lease' | 'analyzing-lease' | 'review-lease';

export default function PropertyUploader({ onAnalysisComplete, initialStep = 'upload-property-doc' }: PropertyUploaderProps) {
    const [step, setStep] = useState<Step>(initialStep);
    const [dragActive, setDragActive] = useState(false);

    // Data state
    const [propertyData, setPropertyData] = useState<ExtractedPropertyData>({ confidence: {} } as ExtractedPropertyData);
    const [tenantData, setTenantData] = useState<ExtractedTenantData>({ confidence: {} } as ExtractedTenantData);

    // Initialize rent roll if starting in review mode
    const [rentRollData, setRentRollData] = useState<RentRollData | null>(() => {
        if (initialStep === 'review-rent-roll') {
            return {
                units: Array(10).fill(null).map(() => ({
                    unitNumber: '',
                    tenantName: '',
                    currentRent: 0,
                    deposit: 0,
                    leaseEndDate: '',
                    status: 'vacant'
                })),
                totals: { totalMonthlyRent: 0, totalDeposits: 0 },
                propertyAddress: '',
                confidence: { overall: 1.0 }
            } as RentRollData;
        }
        return null;
    });

    // UI state
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isRentRollReviewOpen, setIsRentRollReviewOpen] = useState(initialStep === 'review-rent-roll');
    const [showSkipWarning, setShowSkipWarning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showManualInput, setShowManualInput] = useState(false);

    const handleCreateManualRentRoll = (count: number) => {
        const blankUnits = Array(count).fill(null).map((_, i) => ({
            unitNumber: (i + 1).toString(),
            tenantName: '',
            currentRent: 0,
            deposit: 0,
            leaseEndDate: '',
            status: 'vacant'
        }));

        setRentRollData({
            units: blankUnits,
            totals: {
                totalMonthlyRent: 0,
                totalDeposits: 0
            },
            propertyAddress: '',
            confidence: { overall: 1.0 }
        });
        setStep('review-rent-roll');
        setIsRentRollReviewOpen(true);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFile = useCallback(async (file: File, context: 'property-doc' | 'lease') => {
        let nextStep: Step;
        if (context === 'property-doc') nextStep = 'analyzing-doc';
        else nextStep = 'analyzing-lease';

        setStep(nextStep);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            // API autodetects type, so context is just for our UI flow

            const response = await fetch('/api/properties/parse', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Failed to analyze document');

            if (result.documentType === 'rent_roll') {
                setRentRollData(result.extractedData);
                setStep('review-rent-roll');
                setIsRentRollReviewOpen(true);

                // If we also got property address from Rent Roll, set it
                if (result.extractedData.propertyAddress) {
                    setPropertyData(prev => ({
                        ...prev,
                        property: {
                            ...prev.property,
                            address: result.extractedData.propertyAddress
                        }
                    }));
                }
            } else if (result.documentType === 'property' || result.documentType === 'deed') {
                setPropertyData(result.extractedData);
                setStep('review-deed');
                setIsReviewOpen(true);
            } else if (result.documentType === 'lease') {
                setTenantData(result.extractedData);
                setStep('review-lease');
                // If this was uploaded in the property-doc step, we might want to warn or just proceed
            } else {
                // Determine fallback based on context
                if (context === 'property-doc') {
                    // Assume property data if unsure, or maybe show error
                    setPropertyData(result.extractedData);
                    setStep('review-deed');
                    setIsReviewOpen(true);
                } else {
                    setTenantData(result.extractedData);
                    setStep('review-lease');
                }
            }

        } catch (error) {
            console.error('Analysis failed:', error);
            setError('Failed to analyze document. Please ensure it is a valid PDF or Image.');
            setStep(context === 'property-doc' ? 'upload-property-doc' : 'upload-lease');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const context = step === 'upload-lease' ? 'lease' : 'property-doc';
            processFile(e.dataTransfer.files[0], context);
        }
    }, [step, processFile]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const context = step === 'upload-lease' ? 'lease' : 'property-doc';
            processFile(e.target.files[0], context);
        }
    }, [step, processFile]);

    const handlePropertySave = (data: ExtractedPropertyData) => {
        setPropertyData(data);
        setIsReviewOpen(false);
        setStep('occupancy-check');
    };

    const handleRentRollSave = (data: RentRollData) => {
        setRentRollData(data);
        setIsRentRollReviewOpen(false);

        // Update property address if changed in review
        if (data.propertyAddress) {
            setPropertyData(prev => ({
                ...prev,
                property: { ...prev.property, address: data.propertyAddress }
            }));
        }

        // Skip occupancy check if we have units
        handleFinalSubmit(data.units);
    };

    const handleFinalSubmit = (rentRollUnits?: RentRollData['units']) => {
        onAnalysisComplete({
            ...propertyData,
            tenant: tenantData,
            rentRollUnits: rentRollUnits || (rentRollData ? rentRollData.units : undefined)
        });
    };

    const renderUploadZone = (title: string, subtitle: string, icon: React.ReactNode) => (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center ${dragActive
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-white/10 hover:border-white/20 bg-card/30 backdrop-blur-sm'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
            />
            <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                <div className="bg-card p-4 rounded-full shadow-sm border border-white/10">
                    {icon}
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: subtitle }} />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground/60 pt-2">
                        Supports PDF, JPG, PNG
                    </p>
                    <p className="text-[10px] text-green-400/80 font-medium">
                        ✨ Best for: Rent Rolls, Deeds, Leases
                    </p>
                </div>
                {error && (
                    <div className="text-red-400 text-xs flex items-center mt-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    const renderLoading = (message: string) => (
        <div className="text-center py-12">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-card p-4 rounded-full shadow-sm border border-white/10 mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
            <h3 className="font-semibold text-foreground">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">Using AI to extract details...</p>
        </div>
    );

    const renderReviewField = (label: string, value: string | undefined | number, onChange: (val: string) => void) => (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none transition-all"
            />
        </div>
    );

    // STEP 1: Upload Property Document (Deed OR Rent Roll)
    if (step === 'upload-property-doc') {
        return (
            <div className="w-full max-w-xl mx-auto">
                <div className="mb-6 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
                        Recommended
                    </span>
                    <h3 className="text-lg font-semibold text-white mb-2">Start with Documents</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Upload a <strong>Rent Roll</strong> to import multiple tenants at once, or a <strong>Deed</strong> to verify ownership.
                    </p>
                </div>
                {renderUploadZone(
                    "Upload Property Documents",
                    "Drag & drop a <strong>Rent Roll</strong> or <strong>Deed</strong>",
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                )}

                <div className="mt-6 flex items-center justify-center gap-4">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="mt-6 text-center space-y-3">
                    <div className="flex flex-col items-center gap-3">
                        {!showManualInput ? (
                            <button
                                onClick={() => setShowManualInput(true)}
                                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors border-b border-transparent hover:border-emerald-500/50 pb-0.5"
                            >
                                Create Rent Roll from Scratch
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <label className="text-sm text-slate-300">How many units?</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                    placeholder="#"
                                    // We need a ref or state here, let's use a local variable approach or better yet, simple state
                                    // Since this is inside render, let's add state to component above
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt((e.target as HTMLInputElement).value);
                                            if (val > 0) handleCreateManualRentRoll(val);
                                        }
                                    }}
                                    id="manual-unit-count"
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('manual-unit-count') as HTMLInputElement;
                                        const val = parseInt(input.value);
                                        if (val > 0) handleCreateManualRentRoll(val);
                                    }}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
                                >
                                    Go
                                </button>
                                <button
                                    onClick={() => setShowManualInput(false)}
                                    className="p-1 hover:bg-white/10 rounded"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-slate-500">or</div>

                    <button
                        onClick={() => {
                            setPropertyData({
                                confidence: {},
                                property: { address: '', type: 'multi_unit', units: 1 },
                                owner: { legalName1: '' },
                                financials: {} // Initialize empty financials
                            } as ExtractedPropertyData);
                            setStep('review-deed');
                            setIsReviewOpen(true);
                        }}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5"
                    >
                        Enter Property Details Manually
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                        Skip the AI and type in info yourself.
                    </p>
                </div>
            </div>
        );
    }

    // STEP 2: Analyzing Document
    if (step === 'analyzing-doc') {
        return renderLoading("Analyzing Document");
    }

    // STEP 2b: Review Rent Roll
    if (step === 'review-rent-roll' && rentRollData) {
        return (
            <>
                <div className="w-full max-w-xl mx-auto text-center py-12">
                    <p className="text-muted-foreground mb-4">Reviewing extracted rent roll...</p>
                    <button
                        onClick={() => setIsRentRollReviewOpen(true)}
                        className="text-primary hover:underline text-sm"
                    >
                        Re-open Review Modal
                    </button>
                </div>

                <RentRollReviewModal
                    isOpen={isRentRollReviewOpen}
                    onClose={() => setStep('upload-property-doc')}
                    onSave={handleRentRollSave}
                    data={rentRollData}
                />
            </>
        );
    }

    // STEP 3: Review Deed (Modal Trigger)
    if (step === 'review-deed') {
        return (
            <>
                <div className="w-full max-w-xl mx-auto text-center py-12">
                    <p className="text-muted-foreground mb-4">Reviewing extracted data...</p>
                    <button
                        onClick={() => setIsReviewOpen(true)}
                        className="text-primary hover:underline text-sm"
                    >
                        Re-open Review Modal
                    </button>
                </div>

                <PropertyReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setStep('upload-property-doc')} // If cancelled, go back
                    onSave={handlePropertySave}
                    data={propertyData}
                />
            </>
        );
    }

    // STEP 4: Occupancy Check
    if (step === 'occupancy-check') {
        return (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-card/30 p-8 rounded-xl border border-white/5">
                    <User className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground">Is this property currently rented?</h3>
                    <p className="text-muted-foreground mt-2 mb-8">
                        If yes, we&apos;ll need to upload the Lease Agreement to import tenant details.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleFinalSubmit()}
                            className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-left group"
                        >
                            <span className="block font-semibold text-foreground mb-1 group-hover:text-primary">No, it&apos;s vacant</span>
                            <span className="text-xs text-muted-foreground">Skip tenant setup for now.</span>
                        </button>
                        <button
                            onClick={() => setStep('upload-lease')}
                            className="p-4 border border-primary/50 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all text-left"
                        >
                            <span className="block font-semibold text-primary mb-1">Yes, it&apos;s occupied</span>
                            <span className="text-xs text-muted-foreground">Upload lease next.</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 5: Upload Lease
    if (step === 'upload-lease') {
        return (
            <div className="w-full max-w-xl mx-auto animate-in fade-in">
                <div className="mb-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Add Tenants</h3>
                </div>
                {renderUploadZone(
                    "Upload Lease Agreement",
                    "Drag & drop the current <strong>Lease Agreement</strong>.",
                    <FileText className="w-8 h-8 text-muted-foreground" />
                )}
                <button
                    onClick={() => setShowSkipWarning(true)}
                    className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    Skip this step
                </button>

                {showSkipWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-card p-6 rounded-xl shadow-2xl max-w-md w-full border border-white/10">
                            <div className="flex items-center gap-3 mb-4 text-orange-400">
                                <AlertCircle className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Heads up!</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Skipping the lease upload means we cannot <strong>automatically create tenant accounts</strong> or <strong>set up rent collection</strong>.
                                <br /><br />
                                You will need to manually invite tenants and configure payments later in the Tenant Portal.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSkipWarning(false)}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => handleFinalSubmit()}
                                    className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Skip Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // STEP 6: Analyzing Lease
    if (step === 'analyzing-lease') {
        return renderLoading("Analyzing Lease Agreement");
    }

    // STEP 7: Review Lease Data (Simple)
    if (step === 'review-lease') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                        <h4 className="text-sm font-semibold text-green-400">Lease Analyzed Successfully</h4>
                        <p className="text-xs text-green-400/80">Tenant details extracted.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {renderReviewField("Tenant Name", tenantData.name, (val) => setTenantData({ ...tenantData, name: val }))}
                    <div className="grid grid-cols-2 gap-4">
                        {renderReviewField("Monthly Rent", tenantData.rentAmount, (val) => setTenantData({ ...tenantData, rentAmount: parseFloat(val) }))}
                        {renderReviewField("Lease End Date", tenantData.leaseEndDate, (val) => setTenantData({ ...tenantData, leaseEndDate: val }))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setStep('upload-lease')}
                        className="flex-1 py-3 border border-white/10 rounded-lg text-muted-foreground hover:bg-white/5 transition-all"
                    >
                        Re-upload
                    </button>
                    <button
                        onClick={() => handleFinalSubmit()}
                        className="flex-[2] bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Finish & Save Property
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
