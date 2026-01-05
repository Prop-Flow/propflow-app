'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserDropdown from './UserDropdown';
import { LayoutDashboard, Building2, Users, FileText, Settings, MessageSquare, AlertCircle, Receipt, Activity, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard Shadcn utils location.
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import DevRoleSwitcher from '@/components/dev/DevRoleSwitcher';

interface DashboardShellProps {
    children: React.ReactNode;
    role?: 'tenant' | 'owner' | 'manager'; // to customize sidebar links
}

import BrandLogo from '@/components/ui/BrandLogo';
import ReactiveBackground from '@/components/ui/ReactiveBackground';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardShell({ children, role = 'owner' }: DashboardShellProps) {
    const pathname = usePathname();
    const { user, loading } = useAuth(role);

    if (loading || !user) return null;

    const ownerLinks = [
        { href: '/dashboard/owner', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/properties', label: 'Properties', icon: Building2 },
        { href: '/tenants', label: 'Tenants', icon: Users },
        { href: '/maintenance', label: 'Maintenance', icon: Hammer },
        { href: '/dashboard/owner/utilities', label: 'Utilities', icon: Activity },
        { href: '/dashboard/owner/billing', label: 'Billing', icon: Receipt },
        { href: '/communications', label: 'Communications', icon: MessageSquare },
        { href: '/compliance', label: 'Compliance', icon: AlertCircle },
        { href: '/documents', label: 'Documents', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    const managerLinks = [
        { href: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/properties', label: 'Properties', icon: Building2 },
        { href: '/tenants', label: 'Tenants', icon: Users },
        { href: '/maintenance', label: 'Maintenance', icon: Hammer },
        { href: '/compliance', label: 'Compliance', icon: AlertCircle },
        { href: '/communications', label: 'Communications', icon: MessageSquare },
        { href: '/documents', label: 'Documents', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    const tenantLinks = [
        { href: '/dashboard/tenant', label: 'Home', icon: LayoutDashboard },
        { href: '/dashboard/tenant/documents', label: 'My Documents', icon: FileText },
        { href: '/dashboard/tenant/payments', label: 'Payments', icon: Receipt },
        // ... more tenant links
    ];

    const links = role === 'manager' ? managerLinks : role === 'tenant' ? tenantLinks : ownerLinks;

    // Normalize role for display logic
    const displayRole = role.toLowerCase();

    return (
        <div className="min-h-screen bg-background flex text-foreground relative overflow-hidden">
            <ReactiveBackground />

            <DevRoleSwitcher />

            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r border-white/5 bg-background/80 backdrop-blur-md">
                <div className="relative flex flex-col items-center justify-center px-4 pt-8 pb-4 border-b border-white/5 gap-0">
                    <BrandLogo variant="sidebar" />
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                        {displayRole === 'owner' ? 'Owner Dashboard' : displayRole === 'manager' ? 'Manager Dashboard' : 'Tenant Portal'}
                    </h2>

                    <div className="flex items-center space-x-4">
                        <NotificationDropdown />
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <UserDropdown />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div >
    );
}
