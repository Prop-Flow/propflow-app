
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
            const devModeStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('propflow_dev_mode='))
                ?.split('=')[1];
            setIsDevMode(devModeStr === 'true');
        };
        checkDevMode();
    }, []);

    useEffect(() => {
        async function fetchUser() {
            // Priority 1: Standard Auth (Official Session)
            if (status === 'loading') {
                return;
            }

            if (status === 'authenticated' && session?.user) {
                try {
                    // Fetch full user data including role
                    const response = await fetch('/api/user/me');
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);

                        // Check role-based access
                        if (requireRole) {
                            const mappedRole = requireRole === 'manager' ? 'PROPERTY_MANAGER' : requireRole.toUpperCase();
                            if (userData.role !== mappedRole) {
                                let target = '/dashboard/owner';
                                if (userData.role === 'TENANT') target = '/dashboard/tenant';
                                else if (userData.role === 'PROPERTY_MANAGER') target = '/dashboard/manager';
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
            if (isDevMode && status === 'unauthenticated') {
                const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('propflow_user') || 'null') : null;
                if (localUser) {
                    setUser(localUser);

                    if (requireRole) {
                        const mappedRole = requireRole === 'manager' ? 'property_manager' : requireRole;
                        if (localUser.role !== mappedRole) {
                            let target = '/dashboard/owner';
                            if (localUser.role === 'tenant') target = '/dashboard/tenant';
                            else if (localUser.role === 'property_manager') target = '/dashboard/manager';
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
        if (isDevMode) {
            localStorage.removeItem('propflow_user');
            document.cookie = "propflow_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "propflow_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.reload();
        } else {
            await signOut({ redirect: false });
            setUser(null);
            router.push('/login');
        }
    };

    return {
        user,
        loading,
        logout
    };
}
