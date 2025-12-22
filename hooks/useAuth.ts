'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    role: 'tenant' | 'owner' | 'property_manager';
    firstName: string;
    lastName: string;
    email: string;
}

export function useAuth(requireRole?: 'tenant' | 'owner' | 'manager') {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Run on client only
        const stored = localStorage.getItem('propflow_user');
        if (stored) {
            try {
                const parsedUser = JSON.parse(stored);
                setUser(parsedUser);

                if (requireRole) {
                    const mappedRole = requireRole === 'manager' ? 'property_manager' : requireRole;

                    if (parsedUser.role !== mappedRole) {
                        // Redirect to their correct dashboard if accessing wrong area
                        let target = '/dashboard/owner';
                        if (parsedUser.role === 'tenant') target = '/dashboard/tenant';
                        else if (parsedUser.role === 'property_manager') target = '/dashboard/manager';

                        router.replace(target);
                    }
                }
            } catch (e) {
                console.error("Failed to parse user", e);
                localStorage.removeItem('propflow_user');
                setUser(null);
            }
        } else {
            // No user found
            if (requireRole) {
                router.replace('/signup'); // redirect to login/signup
            }
        }
        setLoading(false);
    }, [requireRole, router]);

    const logout = () => {
        localStorage.removeItem('propflow_user');
        setUser(null);
        router.push('/signup');
    };

    return { user, loading, logout };
}
