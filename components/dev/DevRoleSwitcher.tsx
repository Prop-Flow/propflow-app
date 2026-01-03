'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, ChevronUp, User, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DevRoleSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('owner');
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkDevMode = () => {
            const devModeStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('propflow_dev_mode='))
                ?.split('=')[1];
            setIsDevMode(devModeStr === 'true');

            const devRoleStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('propflow_dev_role='))
                ?.split('=')[1];
            if (devRoleStr) setCurrentRole(devRoleStr);
        };
        checkDevMode();
    }, []);

    if (!isDevMode) return null;

    const roles = [
        { id: 'owner', label: 'Owner', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'manager', label: 'Manager', icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
        { id: 'tenant', label: 'Tenant', icon: User, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    const switchRole = (role: string) => {
        // Update cookie
        document.cookie = `propflow_dev_role=${role}; path=/; max-age=31536000`;
        setCurrentRole(role);

        // Update localStorage user if it exists
        const localUser = JSON.parse(localStorage.getItem('propflow_user') || '{}');
        if (localUser.id) {
            localUser.role = role;
            localStorage.setItem('propflow_user', JSON.stringify(localUser));
        }

        // Redirect to appropriate dashboard
        let target = '/dashboard/owner';
        if (role === 'tenant') target = '/dashboard/tenant';
        else if (role === 'manager') target = '/dashboard/manager';

        setIsOpen(false);
        router.push(target);
        setTimeout(() => window.location.reload(), 100);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-4 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Switch Role View</span>
                    </div>
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isActive = currentRole === role.id;
                        return (
                            <button
                                key={role.id}
                                onClick={() => switchRole(role.id)}
                                className={cn(
                                    "w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all group",
                                    isActive
                                        ? "bg-white/10 text-white font-semibold"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className={cn("p-1.5 rounded-lg mr-3 transition-colors", isActive ? role.bg : "bg-white/5 group-hover:bg-white/10")}>
                                    <Icon className={cn("w-4 h-4", isActive ? role.color : "text-slate-500")} />
                                </div>
                                {role.label}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 group",
                    isOpen ? "ring-2 ring-blue-500/50 border-blue-500/50" : "hover:border-white/20"
                )}
            >
                <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Dev Mode</p>
                    <p className="text-sm font-semibold text-white leading-none">
                        {roles.find(r => r.id === currentRole)?.label || 'Switch View'}
                    </p>
                </div>
                <ChevronUp className={cn("w-4 h-4 text-slate-500 ml-1 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
            </button>
        </div>
    );
}
