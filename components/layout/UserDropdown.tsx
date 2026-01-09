'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, Settings, Mail, LogOut } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

export default function UserDropdown() {
    const { user, profile, loading, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    if (loading || !user) return null; // Don't show if not logged in

    // Fallback to displayName or email if profile not ready
    const firstName = profile?.firstName || user.displayName?.split(' ')[0] || '';
    const lastName = profile?.lastName || user.displayName?.split(' ')[1] || '';
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || user.email?.[0].toUpperCase() || 'U';
    const fullName = `${firstName} ${lastName}`.trim() || user.email;

    // Map database role to display name
    let roleDisplay = 'User';
    const activeRole = (profile?.role || 'TENANT').toUpperCase();

    if (activeRole === 'OWNER') roleDisplay = 'Owner';
    else if (activeRole === 'PROPERTY_MANAGER') roleDisplay = 'Property Manager';
    else if (activeRole === 'TENANT') roleDisplay = 'Tenant';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors focus:outline-none"
            >
                {/* Initials over Gradient */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-xs">
                    {initials}
                </div>

                <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-medium text-white">{fullName}</span>
                    <span className="text-xs text-muted-foreground">{roleDisplay}</span>
                </div>

                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-2 space-y-1">
                        <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
                            <User className="w-4 h-4 mr-3" />
                            Profile
                        </Link>
                        <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                        </Link>
                        <Link href="/contact" className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
                            <Mail className="w-4 h-4 mr-3" />
                            Contact Us
                        </Link>
                        <div className="h-px bg-border my-1" />
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-500 rounded-md transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
