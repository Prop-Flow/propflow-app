'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import ComplianceCheckButton from '@/components/compliance/ComplianceCheckButton';
import { useAuth } from '@/hooks/useAuth';

export default function CompliancePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentRole = (user?.role === 'property_manager' ? 'manager' : user?.role as "tenant" | "owner" | "manager") || 'owner';

    return (
        <DashboardShell role={currentRole}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Compliance</h1>
                    <p className="text-muted-foreground mt-1">Track and manage property compliance tasks</p>
                </div>
                <ComplianceCheckButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending</p>
                            <p className="text-3xl font-bold text-foreground mt-2">0</p>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 hover:border-green-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                            <p className="text-3xl font-bold text-foreground mt-2">100%</p>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-dashed border-white/10 p-12 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">No active compliance checks</h3>
                <p className="text-muted-foreground mb-6">Create a new compliance check to get started</p>
            </div>
        </DashboardShell>
    );
}
