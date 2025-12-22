'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function ManagerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell role="manager">
            {children}
        </DashboardShell>
    );
}
