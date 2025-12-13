import { prisma } from '@/lib/prisma';
import { isOverdue } from '@/lib/utils/date-helpers';

export interface MissingDocument {
    tenantId: string;
    tenantName: string;
    documentType: string;
    status: string;
    daysOverdue?: number;
}

/**
 * Get all missing documents for a tenant
 */
export async function getMissingDocuments(tenantId: string): Promise<MissingDocument[]> {
    const documents = await prisma.document.findMany({
        where: {
            tenantId,
            status: {
                in: ['pending', 'expired'],
            },
        },
        include: {
            tenant: true,
        },
    });

    return documents.map(doc => {
        const daysOverdue = doc.expirationDate && isOverdue(doc.expirationDate)
            ? Math.floor((Date.now() - new Date(doc.expirationDate).getTime()) / (1000 * 60 * 60 * 24))
            : undefined;

        return {
            tenantId: doc.tenantId,
            tenantName: doc.tenant.name,
            documentType: doc.type,
            status: doc.status,
            daysOverdue,
        };
    });
}

/**
 * Get all tenants with missing documents
 */
export async function getTenantsWithMissingDocuments(): Promise<Array<{
    tenantId: string;
    tenantName: string;
    propertyId: string;
    missingDocuments: string[];
}>> {
    const tenants = await prisma.tenant.findMany({
        where: {
            status: 'active',
            documents: {
                some: {
                    status: {
                        in: ['pending', 'expired'],
                    },
                },
            },
        },
        include: {
            documents: {
                where: {
                    status: {
                        in: ['pending', 'expired'],
                    },
                },
            },
        },
    });

    return tenants.map(tenant => ({
        tenantId: tenant.id,
        tenantName: tenant.name,
        propertyId: tenant.propertyId,
        missingDocuments: tenant.documents.map(doc => doc.type),
    }));
}

/**
 * Check if a specific document is missing for a tenant
 */
export async function isDocumentMissing(
    tenantId: string,
    documentType: string
): Promise<boolean> {
    const document = await prisma.document.findFirst({
        where: {
            tenantId,
            type: documentType,
            status: {
                in: ['submitted', 'approved'],
            },
        },
    });

    return !document;
}

/**
 * Mark document as submitted
 */
export async function markDocumentSubmitted(
    documentId: string,
    fileUrl: string
): Promise<void> {
    await prisma.document.update({
        where: { id: documentId },
        data: {
            status: 'submitted',
            fileUrl,
            uploadedAt: new Date(),
        },
    });
}

/**
 * Create missing document records for a tenant
 */
export async function createRequiredDocuments(
    tenantId: string,
    documentTypes: string[]
): Promise<void> {
    const existingDocs = await prisma.document.findMany({
        where: {
            tenantId,
            type: {
                in: documentTypes,
            },
        },
    });

    const existingTypes = new Set(existingDocs.map(doc => doc.type));
    const missingTypes = documentTypes.filter(type => !existingTypes.has(type));

    if (missingTypes.length > 0) {
        await prisma.document.createMany({
            data: missingTypes.map(type => ({
                tenantId,
                type,
                name: `${type.toUpperCase()} - Required`,
                status: 'pending',
            })),
        });
    }
}

/**
 * Check for expired documents
 */
export async function checkExpiredDocuments(): Promise<Array<{
    documentId: string;
    tenantId: string;
    documentType: string;
    expirationDate: Date;
}>> {
    const expiredDocs = await prisma.document.findMany({
        where: {
            expirationDate: {
                lt: new Date(),
            },
            status: {
                not: 'expired',
            },
        },
    });

    // Update status to expired
    await prisma.document.updateMany({
        where: {
            id: {
                in: expiredDocs.map(doc => doc.id),
            },
        },
        data: {
            status: 'expired',
        },
    });

    return expiredDocs.map(doc => ({
        documentId: doc.id,
        tenantId: doc.tenantId,
        documentType: doc.type,
        expirationDate: doc.expirationDate!,
    }));
}
