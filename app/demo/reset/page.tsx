/**
 * Demo Reset Page
 * 
 * Hidden utility page for resetting MVP demo to empty state.
 * Only accessible when demo mode is enabled.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isDemoMode, isMVPDemoUser } from '@/lib/config/demo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function DemoResetPage() {
    const [isResetting, setIsResetting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    // Check if demo mode is enabled and user is MVP demo
    const demoMode = isDemoMode();
    const isMVPDemo = isMVPDemoUser(user?.email || undefined);

    if (!demoMode || !isMVPDemo) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-800">
                <Card className="max-w-md p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">
                        This page is only accessible in demo mode for the MVP demo account.
                    </p>
                </Card>
            </div>
        );
    }

    const handleReset = async () => {
        setIsResetting(true);
        setError(null);

        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();
            const response = await fetch('/api/demo/reset-activation', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to reset demo');
            }

            // Redirect to dashboard (will show empty state)
            router.push('/dashboard/owner');
        } catch (err) {
            console.error('Reset error:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset demo');
        } finally {
            setIsResetting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <Card className="max-w-md w-full p-8">
                <div className="text-center mb-6">
                    <RotateCcw className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Reset MVP Demo</h1>
                    <p className="text-muted-foreground">
                        Return demo account to empty state for recording
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}

                {!showConfirm ? (
                    <Button
                        onClick={() => setShowConfirm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Reset Demo
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-sm text-amber-200">
                                This will set <code className="px-1 py-0.5 bg-black/30 rounded">demoActivated=false</code>.
                                Dashboard will return to empty state.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowConfirm(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isResetting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReset}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={isResetting}
                            >
                                {isResetting ? 'Resetting...' : 'Confirm Reset'}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-muted-foreground text-center">
                        Use this before recording to ensure a clean demo flow
                    </p>
                </div>
            </Card>
        </div>
    );
}
