import axios from 'axios';

export interface N8NWebhookPayload {
    workflowType: 'tenant_followup' | 'document_collection' | 'compliance_check';
    tenantId?: string;
    propertyId?: string;
    data: Record<string, any>;
}

/**
 * Trigger n8n workflow via webhook
 */
export async function triggerN8NWorkflow(
    payload: N8NWebhookPayload
): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
        if (!process.env.N8N_WEBHOOK_URL) {
            console.warn('n8n webhook URL not configured');
            return { success: false, error: 'n8n not configured' };
        }

        // Determine specific webhook URL based on workflow type
        let webhookUrl = process.env.N8N_WEBHOOK_URL;

        switch (payload.workflowType) {
            case 'tenant_followup':
                webhookUrl = process.env.N8N_TENANT_FOLLOWUP_WEBHOOK || webhookUrl;
                break;
            case 'document_collection':
                webhookUrl = process.env.N8N_DOCUMENT_COLLECTION_WEBHOOK || webhookUrl;
                break;
            case 'compliance_check':
                webhookUrl = process.env.N8N_COMPLIANCE_CHECK_WEBHOOK || webhookUrl;
                break;
        }

        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        return {
            success: true,
            executionId: response.data?.executionId,
        };
    } catch (error: any) {
        console.error('Error triggering n8n workflow:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Trigger tenant follow-up workflow
 */
export async function triggerTenantFollowup(
    tenantId: string,
    scenario: string,
    details: Record<string, any>
): Promise<{ success: boolean; executionId?: string }> {
    const result = await triggerN8NWorkflow({
        workflowType: 'tenant_followup',
        tenantId,
        data: {
            scenario,
            ...details,
        },
    });

    return {
        success: result.success,
        executionId: result.executionId,
    };
}

/**
 * Trigger document collection workflow
 */
export async function triggerDocumentCollection(
    tenantId: string,
    documentType: string,
    details: Record<string, any>
): Promise<{ success: boolean; executionId?: string }> {
    const result = await triggerN8NWorkflow({
        workflowType: 'document_collection',
        tenantId,
        data: {
            documentType,
            ...details,
        },
    });

    return {
        success: result.success,
        executionId: result.executionId,
    };
}

/**
 * Trigger compliance check workflow
 */
export async function triggerComplianceCheck(
    propertyId?: string
): Promise<{ success: boolean; executionId?: string }> {
    const result = await triggerN8NWorkflow({
        workflowType: 'compliance_check',
        propertyId,
        data: {
            timestamp: new Date().toISOString(),
        },
    });

    return {
        success: result.success,
        executionId: result.executionId,
    };
}
