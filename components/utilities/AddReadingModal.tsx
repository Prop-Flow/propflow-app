'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddReadingModal({ isOpen, onClose }: AddReadingModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: '',
        unit: '',
        utilityType: 'WATER',
        date: new Date().toISOString().split('T')[0],
        value: '',
        unitOfMeasure: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Submitted Reading:', formData);
        setIsLoading(false);
        onClose();
        // Here we would trigger a toast notification
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
                <Card className="bg-[#0c0c0c] border border-white/10 shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                        <CardTitle className="text-lg font-semibold">Add New Reading</CardTitle>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="property">Property</Label>
                                <select
                                    id="property"
                                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select a property</option>
                                    <option value="prop_1">Sunset Apartments</option>
                                    <option value="prop_2">Downtown Lofts</option>
                                    <option value="prop_3">Highland Heights</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Utility Type</Label>
                                    <select
                                        id="type"
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.utilityType}
                                        onChange={(e) => setFormData({ ...formData, utilityType: e.target.value })}
                                    >
                                        <option value="WATER">Water</option>
                                        <option value="ELECTRIC">Electric</option>
                                        <option value="GAS">Gas</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit / Meter</Label>
                                    <Input
                                        id="unit"
                                        placeholder="e.g. 4B or Main"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Reading Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end pt-4 border-t border-white/5">
                            <Button type="button" variant="ghost" className="mr-2" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Reading'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
