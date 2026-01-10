import { ParsedDocument, ExtractedTenantData, ExtractedPropertyData } from './types';

/**
 * AI Service Client (Proxy to propflow-ai-core)
 */

export async function parseDocument(
    fileBuffer: Buffer,
    mimeType: string
): Promise<ParsedDocument> {
    const AI_CORE_URL = process.env.AI_CORE_SERVICE_URL || 'http://localhost:8080';

    // In a real implementation, this would be an HTTP call to the ai-core service
    // For now, we provide the interface and a descriptive error if the URL is missing
    if (!process.env.AI_CORE_SERVICE_URL && process.env.NODE_ENV === 'production') {
        throw new Error("AI Core Service URL not configured");
    }

    try {
        const response = await fetch(`${AI_CORE_URL}/parse`, {
            method: 'POST',
            body: fileBuffer as any,
            headers: {
                'Content-Type': mimeType,
                'X-Source-Repo': 'propflow-app'
            }
        });

        if (!response.ok) {
            throw new Error(`AI Core responded with ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('AI Core Migration Proxy Error:', error);
        throw error;
    }
}

export function validateExtractedData(data: ExtractedTenantData) {
    // Basic local validation for UI responsiveness
    const errors: string[] = [];
    if (!data.name) errors.push('Tenant name is required');
    return { isValid: errors.length === 0, errors };
}

export function validatePropertyData(data: ExtractedPropertyData) {
    const errors: string[] = [];
    if (!data.property?.address) errors.push('Property address is required');
    return { isValid: errors.length === 0, errors };
}

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
}
