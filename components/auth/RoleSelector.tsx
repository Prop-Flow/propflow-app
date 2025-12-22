'use client';
import React from 'react';
import { Building2, Home, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
    role: 'tenant' | 'owner' | 'manager' | null;
    onSelect: (role: 'tenant' | 'owner' | 'manager') => void;
}

export default function RoleSelector({ role, onSelect }: RoleSelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <button
                type="button"
                onClick={() => onSelect('tenant')}
                className={cn(
                    "flex flex-col items-center justify-center p-10 py-12 rounded-2xl border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    "hover:border-primary hover:bg-muted/50",
                    role === 'tenant'
                        ? "border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/20 ring-1 ring-primary/50"
                        : "border-muted bg-card opacity-60 hover:opacity-100 hover:scale-[1.02]"
                )}
            >
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500",
                    role === 'tenant' && "opacity-100"
                )} />
                <Home
                    className={cn(
                        "w-14 h-14 mb-4 transition-all duration-300",
                        role === 'tenant' ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                    )}
                />
                <span
                    className={cn(
                        "text-xl font-bold transition-colors",
                        role === 'tenant' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                >
                    Tenant
                </span>
            </button>

            <button
                type="button"
                onClick={() => onSelect('owner')}
                className={cn(
                    "flex flex-col items-center justify-center p-10 py-12 rounded-2xl border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    "hover:border-primary hover:bg-muted/50",
                    role === 'owner'
                        ? "border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/20 ring-1 ring-primary/50"
                        : "border-muted bg-card opacity-60 hover:opacity-100 hover:scale-[1.02]"
                )}
            >
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500",
                    role === 'owner' && "opacity-100"
                )} />
                <Building2
                    className={cn(
                        "w-14 h-14 mb-4 transition-all duration-300",
                        role === 'owner' ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                    )}
                />
                <span
                    className={cn(
                        "text-xl font-bold transition-colors",
                        role === 'owner' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                >
                    Owner
                </span>
            </button>

            <button
                type="button"
                onClick={() => onSelect('manager')}
                className={cn(
                    "flex flex-col items-center justify-center p-10 py-12 rounded-2xl border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    "hover:border-primary hover:bg-muted/50",
                    role === 'manager'
                        ? "border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/20 ring-1 ring-primary/50"
                        : "border-muted bg-card opacity-60 hover:opacity-100 hover:scale-[1.02]"
                )}
            >
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500",
                    role === 'manager' && "opacity-100"
                )} />
                <Briefcase
                    className={cn(
                        "w-14 h-14 mb-4 transition-all duration-300",
                        role === 'manager' ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                    )}
                />
                <span
                    className={cn(
                        "text-xl font-bold transition-colors",
                        role === 'manager' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                >
                    Manager
                </span>
            </button>
        </div>
    );
}
