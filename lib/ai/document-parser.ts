import OpenAI from 'openai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');
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

export interface ExtractedPropertyData {
    owner: {
        legalName1?: string;
        legalName2?: string;
        email?: string;
        phone?: string;
        mailingAddress?: string;
    };
    property: {
        address?: string;
        type?: 'condo' | 'single_family' | 'multi_unit' | 'commercial';
        beds?: number;
        baths?: number;
        garageSpaces?: number;
        upgrades?: string;
    };
    financials: {
        listPrice?: number;
        hoaFee?: number;
        taxAmount?: number;
    };
    legalDescription?: string;
    documentType?: 'deed' | 'lease' | 'management_agreement' | 'other';
    confidence: {
        [key: string]: number;
    };
}

export interface RentRollData {
    propertyAddress?: string;
    units: {
        unitNumber: string;
        tenantName: string;
        marketRent?: number;
        currentRent?: number;
        leaseStartDate?: string;
        leaseEndDate?: string;
        deposit?: number;
        balance?: number;
    }[];
    totals: {
        totalMonthlyRent?: number;
        totalDeposits?: number;
    };
    confidence: {
        [key: string]: number;
    };
}

export interface ParsedDocument {
    documentType: 'lease' | 'application' | 'id' | 'w9' | 'property' | 'rent_roll' | 'unknown';
    extractedData: ExtractedTenantData | ExtractedPropertyData | RentRollData;
    overallConfidence: number;
    rawText?: string;
}

/**
 * Parse document using GPT-4 Vision for images or text extraction for PDFs
 */
export async function parseDocument(
    fileBuffer: Buffer,
    mimeType: string
): Promise<ParsedDocument> {
    try {
        const openai = getOpenAIClient();

        // Determine if it's an image or PDF
        const isImage = mimeType.startsWith('image/');
        const isPDF = mimeType === 'application/pdf';

        let extractedText = '';
        let documentType: ParsedDocument['documentType'] = 'unknown';

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

            documentType = (classificationResponse.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];

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
            // Extract text from PDF
            const pdfData = await pdf(fileBuffer);
            const rawText = pdfData.text.substring(0, 20000); // Truncate to avoid token limits

            // 1. Classify the document based on text
            const classificationResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: `${DOCUMENT_CLASSIFICATION_PROMPT}\n\nDocument Text:\n${rawText}`
                    }
                ],
                max_tokens: 50,
            });

            documentType = (classificationResponse.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];

            // 2. Extract data based on classified type
            const extractionPrompt = buildExtractionPrompt(documentType);

            const extractionResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: `${extractionPrompt}\n\nDocument Text:\n${rawText}`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1000,
            });

            extractedText = extractionResponse.choices[0]?.message?.content || '{}';

        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'text/csv' || mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            // Handle Spreadsheets (Excel/CSV)
            // Dynamic import to avoid issues if not installed or server-side only
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

            // Convert first sheet to CSV text
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawText = XLSX.utils.sheet_to_csv(worksheet).substring(0, 20000);

            // 1. Classify (likely rent_roll, but let AI confirm)
            const classificationResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: `${DOCUMENT_CLASSIFICATION_PROMPT}\n\nDocument Content (Spreadsheet):\n${rawText}`
                    }
                ],
                max_tokens: 50,
            });

            documentType = (classificationResponse.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];

            // 2. Extract data
            const extractionPrompt = buildExtractionPrompt(documentType);

            const extractionResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: `${extractionPrompt}\n\nDocument Content (Spreadsheet):\n${rawText}`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1000,
            });

            extractedText = extractionResponse.choices[0]?.message?.content || '{}';
        }

        // Parse the extracted JSON
        const parsedData = JSON.parse(extractedText);

        // Normalize phone numbers if present
        if ('phone' in parsedData && parsedData.phone) {
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

    if (!data.name) errors.push('Tenant name is required');
    if (data.email && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Invalid email format');
    if (data.phone && !data.phone.match(/^\+?1?\d{10,}$/)) errors.push('Invalid phone number format');
    if (data.leaseStartDate && isNaN(Date.parse(data.leaseStartDate))) errors.push('Invalid lease start date');
    if (data.leaseEndDate && isNaN(Date.parse(data.leaseEndDate))) errors.push('Invalid lease end date');
    if (data.rentAmount && (data.rentAmount < 0 || data.rentAmount > 1000000)) errors.push('Invalid rent amount');

    return { isValid: errors.length === 0, errors };
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
}

/**
 * Validate extracted property data
 */
export function validatePropertyData(data: ExtractedPropertyData): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validations based on Chase Rental Form requirements and critical Deed info
    if (!data.property?.address) errors.push('Property address is required');
    if (!data.owner?.legalName1) errors.push('Primary owner name is required');

    return {
        isValid: errors.length === 0,
        errors,
    };
}
