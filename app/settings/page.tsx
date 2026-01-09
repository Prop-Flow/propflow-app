'use client';


import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const currentRole = (profile?.role === 'property_manager' ? 'manager' : (profile?.role || 'owner')) as "tenant" | "owner" | "manager";
    const firstName = profile?.firstName || '';
    const lastName = profile?.lastName || '';
    const email = user.email || '';

    return (
        <DashboardShell role={currentRole.toLowerCase() as "tenant" | "owner" | "manager"}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
                </div>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
                    Save Changes
                </button>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
                <div className="border-b border-white/5 p-6 flex gap-6">
                    <button className="text-primary font-medium border-b-2 border-primary pb-1">Profile</button>
                    <button className="text-muted-foreground font-medium hover:text-foreground pb-1 transition-colors">Notifications</button>
                    <button className="text-muted-foreground font-medium hover:text-foreground pb-1 transition-colors">Security</button>
                </div>
                <div className="p-8">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground border border-white/10">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Profile Picture</h3>
                            <p className="text-muted-foreground text-sm mb-4">Upload a new photo for your profile</p>
                            <button className="text-sm border border-white/10 text-foreground rounded px-4 py-2 hover:bg-white/5 transition-colors">
                                Upload New
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                            <input
                                type="text"
                                defaultValue={`${firstName} ${lastName}`.trim()}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                            <input
                                type="email"
                                defaultValue={email}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
