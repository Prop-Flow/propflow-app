'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import { MessageSquare, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import AIComposer from '@/components/communications/AIComposer';

export default function CommunicationsPage() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const normalizedRole = (profile?.role || 'owner').toLowerCase();
    const role = (normalizedRole === 'property_manager' ? 'manager' : normalizedRole) as "tenant" | "owner" | "manager" | undefined || 'owner';

    return (
        <DashboardShell role={role}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Communications</h1>
                    <p className="text-muted-foreground mt-1">Manage tenant communications and logs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Integrated AI Composer */}
                    <AIComposer onSend={(msg) => console.log('Sending message:', msg)} />

                    <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-dashed border-white/10 p-12 text-center h-[calc(100%-250px)] flex flex-col items-center justify-center">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                        <p className="text-muted-foreground">Or start a new one using the AI Composer above</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                        <h3 className="font-semibold text-foreground mb-4">Quick Filters</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                    <Mail className="w-4 h-4" /> Email
                                </span>
                                <span className="bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-xs">0</span>
                            </button>
                            <button className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                    <MessageSquare className="w-4 h-4" /> SMS
                                </span>
                                <span className="bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-xs">0</span>
                            </button>
                            <button className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                    <Phone className="w-4 h-4" /> Voice
                                </span>
                                <span className="bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-xs">0</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
