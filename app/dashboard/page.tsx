'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading) return;

        // Redirect to login if not authenticated
        if (!user) {
            router.push('/login');
            return;
        }

        // Redirect based on role from profile
        const role = profile?.role?.toUpperCase();

        if (role === 'OWNER') {
            router.push('/dashboard/owner');
        } else if (role === 'MANAGER') {
            router.push('/dashboard/manager');
        } else if (role === 'TENANT') {
            router.push('/dashboard/tenant');
        } else {
            // Default to owner if role is undefined or invalid
            console.warn('Unknown or missing role:', role, '- defaulting to owner dashboard');
            router.push('/dashboard/owner');
        }
    }, [user, profile, loading, router]);

    // Show loading state while determining role
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading dashboard...</p>
            </div>
        </div>
    );
}
