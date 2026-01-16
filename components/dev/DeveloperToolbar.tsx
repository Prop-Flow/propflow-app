'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Briefcase, Home, Shield, X, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeveloperToolbar() {
    const [isDevMode, setIsDevMode] = useState(false);
    const [currentRole, setCurrentRole] = useState<string>('owner');
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsMounted(true);
        const checkDevMode = () => {
            const devModeStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('propflow_dev_mode='))
                ?.split('=')[1];

            const devRoleStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('propflow_dev_role='))
                ?.split('=')[1];

            setIsDevMode(devModeStr === 'true');
            if (devRoleStr) setCurrentRole(devRoleStr);
        };

        checkDevMode();
        // Periodically check or listen for events if needed
        const interval = setInterval(checkDevMode, 2000);
        return () => clearInterval(interval);
    }, []);

    // Only show on dashboard routes, not on landing page or login
    const isOnDashboard = pathname?.startsWith('/dashboard');

    if (!isMounted || !isDevMode || !isOnDashboard) return null;

    const switchRole = (role: 'owner' | 'tenant' | 'manager') => {
        // Set cookies
        document.cookie = `propflow_dev_role=${role}; path=/; max-age=31536000`;

        // Update localStorage for useAuth
        const mockUser = {
            id: 'dev-user-id',
            firstName: 'Developer',
            lastName: '(Mode)',
            email: 'dev@propflow.ai',
            role: role === 'manager' ? 'property_manager' : role
        };
        localStorage.setItem('propflow_user', JSON.stringify(mockUser));

        // Redirect
        let target = '/dashboard/owner';
        if (role === 'tenant') target = '/dashboard/tenant';
        if (role === 'manager') target = '/dashboard/manager';

        router.push(target);
        // We need a hard reload to reset some states if navigation isn't enough
        setTimeout(() => window.location.reload(), 100);
    };

    const disableDevMode = () => {
        document.cookie = "propflow_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "propflow_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem('propflow_user');
        setIsDevMode(false);
        router.push('/login');
        window.location.reload();
    };

    return (
        <div className="fixed bottom-6 left-6 z-[9999] animate-in fade-in slide-in-from-left-4 duration-500">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 hover:bg-slate-800 transition-all hover:scale-105"
                >
                    <Settings className="w-5 h-5 text-blue-400 animate-spin-slow" />
                    <span className="font-bold text-sm tracking-tight">DEV MODE</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />
                </button>
            ) : (
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-5 min-w-[280px] overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Shield className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm tracking-tight">Developer Tools</h3>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Environment: Local</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Switch Perspective</p>

                        <div className="grid gap-2">
                            <button
                                onClick={() => switchRole('owner')}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-all border",
                                    currentRole === 'owner'
                                        ? "bg-blue-500/10 border-blue-500/50 text-white"
                                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg", currentRole === 'owner' ? "bg-blue-500 text-white" : "bg-slate-800")}>
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Property Owner</span>
                                </div>
                                {currentRole === 'owner' && <ChevronRight className="w-4 h-4 text-blue-400" />}
                            </button>

                            <button
                                onClick={() => switchRole('manager')}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-all border",
                                    currentRole === 'manager'
                                        ? "bg-purple-500/10 border-purple-500/50 text-white"
                                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg", currentRole === 'manager' ? "bg-purple-500 text-white" : "bg-slate-800")}>
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Property Manager</span>
                                </div>
                                {currentRole === 'manager' && <ChevronRight className="w-4 h-4 text-purple-400" />}
                            </button>

                            <button
                                onClick={() => switchRole('tenant')}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-all border",
                                    currentRole === 'tenant'
                                        ? "bg-green-500/10 border-green-500/50 text-white"
                                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg", currentRole === 'tenant' ? "bg-green-500 text-white" : "bg-slate-800")}>
                                        <Home className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Tenant</span>
                                </div>
                                {currentRole === 'tenant' && <ChevronRight className="w-4 h-4 text-green-400" />}
                            </button>
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-2">
                            <button
                                onClick={disableDevMode}
                                className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                <X className="w-4 h-4" />
                                Exit Developer Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
