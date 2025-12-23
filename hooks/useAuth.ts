'use client';

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        async function fetchUser() {
            if (status === 'loading') {
                return;
            }

            if (status === 'unauthenticated') {
                if (requireRole) {
                    router.replace('/login');
                }
                setLoading(false);
                return;
            }

            if (session?.user) {
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
                                // Redirect to their correct dashboard
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
            }

            setLoading(false);
        }

        fetchUser();
    }, [session, status, requireRole, router]);

    const logout = async () => {
        await signOut({ redirect: false });
        setUser(null);
        router.push('/login');
    };

    return { user, loading, logout };
}
