'use client';

import { useState } from 'react';
import { Calculator, DollarSign, Calendar, Building2, Loader2 } from 'lucide-react';

interface DepreciationCalculatorProps {
    propertyId: string;
    initialData?: {
        purchasePrice?: number;
        purchaseDate?: string;
        assessedLandValue?: number;
        assessedBuildingValue?: number;
    };
    onSave?: () => void;
}

export default function DepreciationCalculator({
    propertyId,
    initialData,
    onSave,
}: DepreciationCalculatorProps) {
    const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toString() || '');
    const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || '');
    const [assessedLandValue, setAssessedLandValue] = useState(initialData?.assessedLandValue?.toString() || '');
    const [assessedBuildingValue, setAssessedBuildingValue] = useState(initialData?.assessedBuildingValue?.toString() || '');
    const [taxAssessmentYear, setTaxAssessmentYear] = useState(new Date().getFullYear().toString());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/properties/${propertyId}/depreciation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchasePrice: Number(purchasePrice),
                    purchaseDate,
                    assessedLandValue: Number(assessedLandValue),
                    assessedBuildingValue: Number(assessedBuildingValue),
                    taxAssessmentYear: Number(taxAssessmentYear),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to calculate depreciation');
            }

            setSuccess(true);
            if (onSave) onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const isValid = purchasePrice && purchaseDate && assessedLandValue && assessedBuildingValue;
    const totalAssessed = Number(assessedLandValue || 0) + Number(assessedBuildingValue || 0);
    const landRatio = totalAssessed > 0 ? (Number(assessedLandValue || 0) / totalAssessed * 100).toFixed(1) : '0';
    const buildingRatio = totalAssessed > 0 ? (Number(assessedBuildingValue || 0) / totalAssessed * 100).toFixed(1) : '0';

    return (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Depreciation Calculator</h3>
                    <p className="text-sm text-muted-foreground">IRS MACRS 27.5-year residential rental</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Purchase Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Purchase Price
                        </label>
                        <input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="500000"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Purchase Date
                        </label>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Tax Assessment Values */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-semibold text-white">Tax Assessment Allocation</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">
                                Land Value (from tax card)
                            </label>
                            <input
                                type="number"
                                value={assessedLandValue}
                                onChange={(e) => setAssessedLandValue(e.target.value)}
                                placeholder="100000"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
                            />
                            {totalAssessed > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">{landRatio}% of total</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">
                                Building Value (from tax card)
                            </label>
                            <input
                                type="number"
                                value={assessedBuildingValue}
                                onChange={(e) => setAssessedBuildingValue(e.target.value)}
                                placeholder="400000"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
                            />
                            {totalAssessed > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">{buildingRatio}% of total (depreciable)</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">
                                Assessment Year
                            </label>
                            <input
                                type="number"
                                value={taxAssessmentYear}
                                onChange={(e) => setTaxAssessmentYear(e.target.value)}
                                placeholder="2024"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm">
                                <p className="text-muted-foreground text-xs">Total Assessed</p>
                                <p className="text-white font-semibold">${totalAssessed.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm text-green-400">✓ Depreciation calculated and saved successfully</p>
                    </div>
                )}

                {/* Calculate Button */}
                <button
                    onClick={handleCalculate}
                    disabled={!isValid || loading}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            <Calculator className="w-4 h-4" />
                            Calculate Depreciation
                        </>
                    )}
                </button>

                {/* Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-200">
                        <strong>Note:</strong> This calculator provides estimates based on IRS guidelines.
                        Consult a qualified tax professional for specific tax advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
