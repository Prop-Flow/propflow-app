import { db } from '@/lib/services/firebase-admin';
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
    const maintenanceData = {
        ...input,
        status: 'pending',
        ticketNumber: `REQ-${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const docRef = await db.collection('maintenanceRequests').add(maintenanceData);
    const snapshot = await docRef.get();
    const request = { id: snapshot.id, ...snapshot.data() } as Record<string, unknown>;

    // 2. Fetch linked tenant for notification
    if (request.tenantId) {
        const tenantDoc = await db.collection('tenants').doc(request.tenantId as string).get();
        if (tenantDoc.exists) {
            const tenant = tenantDoc.data()!;
            request.tenant = { id: tenantDoc.id, ...tenant };

            const message = `We've received your maintenance request "${request.title}" (Ticket #${request.ticketNumber}). We'll update you soon.`;

            await sendWithFallback({
                tenantId: tenantDoc.id,
                tenantName: tenant.name,
                phone: tenant.phone || undefined,
                email: tenant.email || undefined,
                message,
                subject: `Maintenance Request Received: ${request.ticketNumber}`,
            });
        }
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
    const docRef = db.collection('maintenanceRequests').doc(requestId);

    // 1. Update Record
    await docRef.update({
        status,
        updatedAt: new Date()
    });

    const snapshot = await docRef.get();
    const request = { id: snapshot.id, ...snapshot.data() } as Record<string, unknown>;

    // 2. Notify Tenant
    if (request.tenantId) {
        const tenantDoc = await db.collection('tenants').doc(request.tenantId as string).get();
        if (tenantDoc.exists) {
            const tenant = tenantDoc.data()!;

            let message = `Your maintenance request #${request.ticketNumber} status has been updated to: ${status.replace('_', ' ').toUpperCase()}.`;
            if (note) {
                message += ` Note: ${note}`;
            }

            await sendWithFallback({
                tenantId: tenantDoc.id,
                tenantName: tenant.name,
                phone: tenant.phone || undefined,
                email: tenant.email || undefined,
                message,
                subject: `Update on Ticket #${request.ticketNumber}`,
            });
        }
    }

    return request;
}
