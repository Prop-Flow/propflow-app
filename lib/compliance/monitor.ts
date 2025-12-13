import { prisma } from '@/lib/prisma';
import { getLeaseRenewalDate, isWithinDays, isOverdue, getComplianceStatus } from '@/lib/utils/date-helpers';

export interface ComplianceAlert {
    id: string;
    type: string;
    title: string;
    dueDate: Date;
    status: 'overdue' | 'urgent' | 'upcoming' | 'future';
    tenantId?: string;
    tenantName?: string;
    propertyId?: string;
    propertyName?: string;
}

/**
 * Scan for upcoming lease renewals
 */
export async function scanLeaseRenewals(daysBeforeExpiry: number = 90): Promise<ComplianceAlert[]> {
    const tenants = await prisma.tenant.findMany({
        where: {
            status: 'active',
            leaseEndDate: {
                not: null,
            },
        },
        include: {
            property: true,
        },
    });

    const alerts: ComplianceAlert[] = [];

    for (const tenant of tenants) {
        if (!tenant.leaseEndDate) continue;

        const renewalDate = getLeaseRenewalDate(tenant.leaseEndDate, daysBeforeExpiry);

        // Check if we're within the renewal window
        if (new Date() >= renewalDate) {
            // Check if compliance item already exists
            const existing = await prisma.complianceItem.findFirst({
                where: {
                    tenantId: tenant.id,
                    type: 'lease_renewal',
                    status: {
                        not: 'completed',
                    },
                },
            });

            if (!existing) {
                // Create new compliance item
                const item = await prisma.complianceItem.create({
                    data: {
                        tenantId: tenant.id,
                        propertyId: tenant.propertyId,
                        type: 'lease_renewal',
                        title: `Lease Renewal - ${tenant.name}`,
                        description: `Lease expires on ${tenant.leaseEndDate.toLocaleDateString()}. Contact tenant about renewal.`,
                        dueDate: tenant.leaseEndDate,
                        status: isOverdue(tenant.leaseEndDate) ? 'overdue' : 'pending',
                        priority: isWithinDays(tenant.leaseEndDate, 30) ? 'high' : 'medium',
                    },
                });

                alerts.push({
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    dueDate: item.dueDate,
                    status: getComplianceStatus(item.dueDate),
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    propertyId: tenant.propertyId,
                    propertyName: tenant.property.name,
                });
            }
        }
    }

    return alerts;
}

/**
 * Get all pending compliance items
 */
export async function getPendingComplianceItems(): Promise<ComplianceAlert[]> {
    const items = await prisma.complianceItem.findMany({
        where: {
            status: {
                in: ['pending', 'overdue'],
            },
        },
        include: {
            tenant: true,
            property: true,
        },
        orderBy: {
            dueDate: 'asc',
        },
    });

    return items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        dueDate: item.dueDate,
        status: getComplianceStatus(item.dueDate),
        tenantId: item.tenantId || undefined,
        tenantName: item.tenant?.name,
        propertyId: item.propertyId || undefined,
        propertyName: item.property?.name,
    }));
}

/**
 * Update overdue compliance items
 */
export async function updateOverdueItems(): Promise<number> {
    const result = await prisma.complianceItem.updateMany({
        where: {
            dueDate: {
                lt: new Date(),
            },
            status: 'pending',
        },
        data: {
            status: 'overdue',
            priority: 'high',
        },
    });

    return result.count;
}

/**
 * Get compliance summary for a property
 */
export async function getPropertyComplianceSummary(propertyId: string): Promise<{
    total: number;
    overdue: number;
    urgent: number;
    upcoming: number;
}> {
    const items = await prisma.complianceItem.findMany({
        where: {
            propertyId,
            status: {
                not: 'completed',
            },
        },
    });

    const summary = {
        total: items.length,
        overdue: 0,
        urgent: 0,
        upcoming: 0,
    };

    items.forEach(item => {
        const status = getComplianceStatus(item.dueDate);
        if (status === 'overdue') summary.overdue++;
        else if (status === 'urgent') summary.urgent++;
        else if (status === 'upcoming') summary.upcoming++;
    });

    return summary;
}

/**
 * Get compliance summary for a tenant
 */
export async function getTenantComplianceSummary(tenantId: string): Promise<{
    total: number;
    overdue: number;
    urgent: number;
    upcoming: number;
}> {
    const items = await prisma.complianceItem.findMany({
        where: {
            tenantId,
            status: {
                not: 'completed',
            },
        },
    });

    const summary = {
        total: items.length,
        overdue: 0,
        urgent: 0,
        upcoming: 0,
    };

    items.forEach(item => {
        const status = getComplianceStatus(item.dueDate);
        if (status === 'overdue') summary.overdue++;
        else if (status === 'urgent') summary.urgent++;
        else if (status === 'upcoming') summary.upcoming++;
    });

    return summary;
}

/**
 * Mark compliance item as completed
 */
export async function markComplianceCompleted(itemId: string): Promise<void> {
    await prisma.complianceItem.update({
        where: { id: itemId },
        data: {
            status: 'completed',
        },
    });
}
