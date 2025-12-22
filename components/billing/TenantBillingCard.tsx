import React from 'react';

interface TenantBillingCardProps {
    tenantName?: string;
    apartmentNumber?: string;
    chargeAmount: number;
    breakdown: {
        sqftPortion: number;
        occupancyPortion: number;
    };
    totalCost: number;
}

export const TenantBillingCard: React.FC<TenantBillingCardProps> = ({
    tenantName = 'Unknown Tenant',
    apartmentNumber,
    chargeAmount,
    breakdown,
    totalCost,
}) => {
    const percentage = totalCost > 0 ? (chargeAmount / totalCost) * 100 : 0;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-gray-900">{tenantName}</h3>
                    <p className="text-sm text-gray-500">Unit: {apartmentNumber || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <span className="block text-lg font-bold text-gray-900">
                        ${chargeAmount.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                    <span className="block text-gray-500">Sq. Footage Share</span>
                    <span className="font-medium text-gray-700">${breakdown.sqftPortion.toFixed(2)}</span>
                </div>
                <div>
                    <span className="block text-gray-500">Occupancy Share</span>
                    <span className="font-medium text-gray-700">${breakdown.occupancyPortion.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};
