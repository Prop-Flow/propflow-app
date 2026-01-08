// Gemini handles PDF parsing natively
import { buildExtractionPrompt, DOCUMENT_CLASSIFICATION_PROMPT } from './extraction-prompts';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { vertexService } from './vertex';
import { Part } from '@google-cloud/vertexai';

export interface ExtractedTenantData {
    name?: string;
    unitNumber?: string;
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
        email?: string;
        phone?: string;
        status?: 'Occupied' | 'Vacant';
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
 * Parse document using Gemini 1.5 multimodal support
 */
export async function parseDocument(
    fileBuffer: Buffer,
    mimeType: string
): Promise<ParsedDocument> {
    try {
        const isImage = mimeType.startsWith('image/');
        const isPDF = mimeType === 'application/pdf';
        const isSpreadsheet = mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            mimeType === 'text/csv' ||
            mimeType.includes('excel') ||
            mimeType.includes('spreadsheet');

        let extractedText = '';
        let documentType: ParsedDocument['documentType'] = 'unknown';

        const base64Data = fileBuffer.toString('base64');
        const documentPart: Part = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        if (isImage || isPDF) {
            // Use Gemini's native multimodal capabilities
            // 1. Classify the document type
            const classificationResponse = await vertexService.generateText([
                { text: DOCUMENT_CLASSIFICATION_PROMPT },
                documentPart
            ]);

            documentType = (classificationResponse.trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];

            // 2. Extract data based on document type
            const extractionPrompt = buildExtractionPrompt(documentType);
            const extractionResponse = await vertexService.generateText([
                { text: extractionPrompt + "\nRespond strictly in JSON format." },
                documentPart
            ]);

            extractedText = extractionResponse || '{}';

        } else if (isSpreadsheet) {
            // Text-based extraction for spreadsheets
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawText = XLSX.utils.sheet_to_csv(worksheet).substring(0, 20000);

            // 1. Classify
            const classificationResponse = await vertexService.generateText(
                `${DOCUMENT_CLASSIFICATION_PROMPT}\n\nDocument Content (Spreadsheet):\n${rawText}`
            );

            documentType = (classificationResponse.trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];

            // 2. Extract
            const extractionPrompt = buildExtractionPrompt(documentType);
            const extractionResponse = await vertexService.generateText(
                `${extractionPrompt}\n\nRespond strictly in JSON format.\n\nDocument Content (Spreadsheet):\n${rawText}`
            );

            extractedText = extractionResponse || '{}';
        }

        // Clean JSON from potential markdown blocks
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

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
