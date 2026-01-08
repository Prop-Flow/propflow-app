
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export interface User {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    name?: string;
}

export function useAuth(requireRole?: 'tenant' | 'owner' | 'manager') {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDevMode, setIsDevMode] = useState(false);

    useEffect(() => {
        const checkDevMode = () => {
            if (typeof document === 'undefined') return;
            const cookies = document.cookie.split('; ');
            const devModeCookie = cookies.find(row => row.startsWith('propflow_dev_mode='));
            const isDev = devModeCookie?.split('=')[1] === 'true';
            setIsDevMode(isDev);
        };

        checkDevMode();

        // Listen for cookie changes or visibility changes to sync state
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkDevMode();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        async function fetchUser() {
            // Priority 1: Standard Auth (Official Session)
            if (status === 'loading') {
                return;
            }

            if (status === 'authenticated' && session?.user) {
                // If we are officially authenticated, ALWAYS disable dev mode state locally
                setIsDevMode(false);

                try {
                    // Fetch full user data including role
                    const response = await fetch('/api/user/me');
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);

                        const userRole = (userData.role || '').toUpperCase();
                        // Check role-based access
                        if (requireRole) {
                            const mappedRole = requireRole === 'manager' ? 'PROPERTY_MANAGER' : requireRole.toUpperCase();
                            if (userRole !== mappedRole) {
                                let target = '/dashboard/owner';
                                if (userRole === 'TENANT') target = '/dashboard/tenant';
                                else if (userRole === 'PROPERTY_MANAGER') target = '/dashboard/manager';
                                router.replace(target);
                            }
                        }
                    } else {
                        console.error('Failed to fetch user data');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                    setUser(null);
                }
                setLoading(false);
                return;
            }

            // Priority 2: Developer Mode (Only if not authenticated)
            // SECURITY: Ensure this is strictly gated to development environment
            if (process.env.NODE_ENV === 'development' && isDevMode && status === 'unauthenticated') {
                const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('propflow_user') || 'null') : null;
                if (localUser) {
                    setUser(localUser);

                    if (requireRole) {
                        const localRole = (localUser.role || '').toUpperCase();
                        const mappedRole = requireRole === 'manager' ? 'PROPERTY_MANAGER' : requireRole.toUpperCase();

                        if (localRole !== mappedRole) {
                            let target = '/dashboard/owner';
                            if (localRole === 'TENANT') target = '/dashboard/tenant';
                            else if (localRole === 'PROPERTY_MANAGER') target = '/dashboard/manager';
                            router.replace(target);
                        }
                    }
                }
                setLoading(false);
                return;
            }

            // Handle unauthenticated state
            if (status === 'unauthenticated' && !isDevMode) {
                if (requireRole) {
                    router.replace('/login');
                }
                setLoading(false);
                setUser(null);
                return;
            }

            setLoading(false);
        }

        fetchUser();
    }, [session, status, requireRole, router, isDevMode]);

    const logout = async () => {
        // ALWAYS clear dev artifacts on logout, regardless of current mode
        localStorage.removeItem('propflow_user');
        sessionStorage.clear();

        // Clear ALL cookies (including NextAuth session cookies)
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = name + "=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        // Perform standard NextAuth signout
        await signOut({ redirect: false });
        setUser(null);

        // Force hard refresh to ensure all states are reset
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return {
        user,
        loading,
        logout
    };
}
