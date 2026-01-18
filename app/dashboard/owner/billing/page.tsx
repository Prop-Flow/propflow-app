'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { RubsCalculator } from '@/components/billing/RubsCalculator';

// Mock data for demo display
const MOCK_BILLING_PROPERTIES = [
    {
        id: 'mock-property-1',
        name: 'The Rise at State College LLC',
        address: '444 E College Ave, State College, PA 16801',
        units: 12,
        tenants: [
            {
                id: 'tenant-1',
                name: 'Sarah Johnson',
                unit: '101',
                rentAmount: 1250,
                status: 'ACTIVE'
            },
            {
                id: 'tenant-2',
                name: 'Michael Chen',
                unit: '203',
                rentAmount: 1150,
                status: 'ACTIVE'
            },
            {
                id: 'tenant-3',
                name: 'Emily Rodriguez',
                unit: '305',
                rentAmount: 1300,
                status: 'ACTIVE'
            },
            {
                id: 'tenant-4',
                name: 'David Kim',
                unit: '412',
                rentAmount: 1225,
                status: 'ACTIVE'
            },
            {
                id: 'tenant-5',
                name: 'Jessica Martinez',
                unit: '508',
                rentAmount: 1200,
                status: 'ACTIVE'
            }
        ]
    }
];

export default function BillingPage() {
    return (
        <DashboardShell role="owner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utility Billing</h1>
                    <p className="text-gray-500">Calculate and distribute utility costs using R.U.B.S.</p>
                </div>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RubsCalculator properties={MOCK_BILLING_PROPERTIES as any} />
            </div>
        </DashboardShell>
    );
}
