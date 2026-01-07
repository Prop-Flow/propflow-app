import { prisma } from '@/lib/prisma';
import { sendWithFallback } from '@/lib/communication/channel-router';

export type CreateMaintenanceRequestInput = {
    propertyId: string;
    tenantId?: string;
    title: string;
    description: string;
    priority?: 'low' | 'normal' | 'high' | 'emergency';
    category?: string;
    location?: string;
};

/**
 * Create a new maintenance request and notify tenant
 */
export async function createMaintenanceRequest(input: CreateMaintenanceRequestInput) {
    // 1. Create Record
    const request = await prisma.maintenanceRequest.create({
        data: {
            ...input,
            status: 'pending',
            ticketNumber: `REQ-${Date.now().toString().slice(-6)}`, // Simple ID generation
        },
        include: {
            tenant: true,
            property: true,
        },
    });

    // 2. Notify Tenant (if linked)
    if (request.tenant) {
        const message = `We've received your maintenance request "${request.title}" (Ticket #${request.ticketNumber}). We'll update you soon.`;

        await sendWithFallback({
            tenantId: request.tenant.id,
            tenantName: request.tenant.name,
            phone: request.tenant.phone || undefined,
            email: request.tenant.email || undefined,
            message,
            subject: `Maintenance Request Received: ${request.ticketNumber}`,
        });
    }

    return request;
}

/**
 * Update maintenance request status and notify tenant
 */
export async function updateMaintenanceRequestStatus(
    requestId: string,
    status: 'pending' | 'in_progress' | 'resolved' | 'closed',
    note?: string
) {
    // 1. Update Record
    const request = await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: { status },
        include: {
            tenant: true,
        },
    });

    // 2. Notify Tenant
    if (request.tenant) {
        let message = `Your maintenance request #${request.ticketNumber} status has been updated to: ${status.replace('_', ' ').toUpperCase()}.`;
        if (note) {
            message += ` Note: ${note}`;
        }

        await sendWithFallback({
            tenantId: request.tenant.id,
            tenantName: request.tenant.name,
            phone: request.tenant.phone || undefined,
            email: request.tenant.email || undefined,
            message,
            subject: `Update on Ticket #${request.ticketNumber}`,
        });
    }

    return request;
}
