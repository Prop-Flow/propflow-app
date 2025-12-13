import OpenAI from 'openai';
import { buildExtractionPrompt, DOCUMENT_CLASSIFICATION_PROMPT } from './extraction-prompts';
import { formatPhoneNumber } from '@/lib/utils/formatters';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }
    return openaiClient;
}

export interface ExtractedTenantData {
    name?: string;
    email?: string;
    phone?: string;
    propertyAddress?: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
    rentAmount?: number;
    securityDeposit?: number;
    emergencyContact?: string;
    currentAddress?: string;
    monthlyIncome?: number;
    employer?: string;
    dateOfBirth?: string;
    confidence: {
        [key: string]: number;
    };
}

export interface ParsedDocument {
    documentType: 'lease' | 'application' | 'id' | 'w9' | 'unknown';
    extractedData: ExtractedTenantData;
    overallConfidence: number;
    rawText?: string;
}

/**
 * Parse document using GPT-4 Vision for images or text extraction for PDFs
 */
export async function parseDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<ParsedDocument> {
    try {
        const openai = getOpenAIClient();

        // Determine if it's an image or PDF
        const isImage = mimeType.startsWith('image/');
        const isPDF = mimeType === 'application/pdf';

        let extractedText = '';
        let documentType: 'lease' | 'application' | 'id' | 'w9' | 'unknown' = 'unknown';

        if (isImage) {
            // Use GPT-4 Vision for images
            const base64Image = fileBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            // First, classify the document type
            const classificationResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: DOCUMENT_CLASSIFICATION_PROMPT },
                            { type: 'image_url', image_url: { url: dataUrl } },
                        ],
                    },
                ],
                max_tokens: 50,
            });

            documentType = (classificationResponse.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown') as any;

            // Then extract data based on document type
            const extractionPrompt = buildExtractionPrompt(documentType);

            const extractionResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: extractionPrompt },
                            { type: 'image_url', image_url: { url: dataUrl } },
                        ],
                    },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1000,
            });

            extractedText = extractionResponse.choices[0]?.message?.content || '{}';

        } else if (isPDF) {
            // For PDFs, extract text first (will implement PDF parsing separately)
            // For now, return a placeholder
            extractedText = '{"name": null, "confidence": {}}';
            documentType = 'lease';
        }

        // Parse the extracted JSON
        const parsedData = JSON.parse(extractedText);

        // Normalize phone numbers
        if (parsedData.phone) {
            parsedData.phone = formatPhoneNumber(parsedData.phone);
        }

        // Calculate overall confidence
        const confidenceValues = Object.values(parsedData.confidence || {}) as number[];
        const overallConfidence = confidenceValues.length > 0
            ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
            : 0;

        return {
            documentType,
            extractedData: parsedData,
            overallConfidence,
            rawText: extractedText,
        };

    } catch (error) {
        console.error('Error parsing document:', error);
        throw new Error('Failed to parse document with AI');
    }
}

/**
 * Validate extracted tenant data
 */
export function validateExtractedData(data: ExtractedTenantData): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check required fields
    if (!data.name) {
        errors.push('Tenant name is required');
    }

    // Validate email format if present
    if (data.email && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push('Invalid email format');
    }

    // Validate phone format if present
    if (data.phone && !data.phone.match(/^\+?1?\d{10,}$/)) {
        errors.push('Invalid phone number format');
    }

    // Validate dates if present
    if (data.leaseStartDate && isNaN(Date.parse(data.leaseStartDate))) {
        errors.push('Invalid lease start date');
    }

    if (data.leaseEndDate && isNaN(Date.parse(data.leaseEndDate))) {
        errors.push('Invalid lease end date');
    }

    // Validate rent amount if present
    if (data.rentAmount && (data.rentAmount < 0 || data.rentAmount > 1000000)) {
        errors.push('Invalid rent amount');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
}
