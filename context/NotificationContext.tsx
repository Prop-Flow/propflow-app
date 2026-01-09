'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    link?: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth(); // We need a way to get the current user ID
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (user?.uid) {
            refreshNotifications();
        }
    }, [user?.uid]);

    const refreshNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        try {
            if (user) {
                const token = await user.getIdToken();
                await fetch(`/api/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error('Failed to mark read', err);
            // Revert on fail? For now, keep optimistic
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            if (user) {
                const token = await user.getIdToken();
                await fetch('/api/notifications/mark-all-read', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({}) // userId is now in token
                });
            }
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    // Helper for parts of the app to locally "push" a notification purely for UI feedback
    // Real persistence would need the POST endpoint.
    const addNotification = async (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        if (!user?.uid) return;

        const tempId = Math.random().toString(36).substring(7);
        const newNotif: Notification = {
            ...n,
            id: tempId,
            read: false,
            createdAt: new Date().toISOString()
        };

        setNotifications(prev => [newNotif, ...prev]);

        // Persist
        try {
            if (user) {
                const token = await user.getIdToken();
                await fetch('/api/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...n
                        // userId extracted from token on server
                    })
                });
            }
            // In ideal world, we swap tempId with real ID here
            refreshNotifications();
        } catch (err) {
            console.error("Failed to persist notification", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            refreshNotifications,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
