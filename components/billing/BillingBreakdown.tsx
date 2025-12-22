"use client";

import React from 'react';
import { TenantBillingCard } from './TenantBillingCard';


// Redefining interface locally to match API response structure if it slightly differs
interface BillingBreakdownItem {
    tenantId: string;
    tenantName?: string;
    apartmentNumber?: string;
    chargeAmount: number;
    squareFootageRatio: number;
    occupancyRatio: number;
    breakdown: {
        sqftPortion: number;
        occupancyPortion: number;
    };
}

interface BillingBreakdownProps {
    items: BillingBreakdownItem[];
    totalCost: number;
}

export const BillingBreakdown: React.FC<BillingBreakdownProps> = ({ items, totalCost }) => {

    const handleExport = () => {
        // TODO: Implement CSV export
        const headers = ["Tenant", "Unit", "Total Charge", "SqFt Charge", "Occupancy Charge"];
        const rows = items.map(item => [
            item.tenantName || 'Unknown',
            item.apartmentNumber || '',
            item.chargeAmount.toFixed(2),
            item.breakdown.sqftPortion.toFixed(2),
            item.breakdown.occupancyPortion.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "billing_breakdown.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!items || items.length === 0) {
        return <div className="text-gray-500 italic text-center p-4">No billing data calculated yet.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Calculation Results</h3>
                    <p className="text-sm text-gray-500">Total to Allocate: <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span></p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <TenantBillingCard
                        key={item.tenantId}
                        tenantName={item.tenantName}
                        apartmentNumber={item.apartmentNumber}
                        chargeAmount={item.chargeAmount}
                        breakdown={item.breakdown}
                        totalCost={totalCost}
                    />
                ))}
            </div>
        </div>
    );
};
