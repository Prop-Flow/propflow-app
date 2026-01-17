/**
 * Empty State Onboarding Component
 * 
 * Shown when user has no properties or when MVP demo is not yet activated.
 * Provides clear CTAs to start adding property data.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Building, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function EmptyStateOnboarding() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
            <Card className="max-w-2xl w-full p-12 text-center bg-card/40 backdrop-blur-xl border-white/10">
                <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-10 h-10 text-blue-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                    Add your first property
                </h2>

                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    Upload a lease agreement or rent roll to get started. We'll extract the details automatically.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={() => router.push('/properties')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Lease
                    </Button>

                    <Button
                        onClick={() => router.push('/properties')}
                        variant="outline"
                        className="flex items-center gap-2 border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Add Manually
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <p className="text-sm text-muted-foreground">
                        Need help? Check out our{' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                            getting started guide
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
}
