
import { VertexAI } from '@google-cloud/vertexai';
import { buildExtractionPrompt, DOCUMENT_CLASSIFICATION_PROMPT } from './extraction-prompts';
import { formatPhoneNumber } from '@/lib/utils/formatters';

// Initialize Vertex AI
// Note: In Cloud Run, project and location are auto-detected or defaults can be used.
// For local dev, GOOGLE_APPLICATION_CREDENTIALS must be set, or run `gcloud auth application-default login`
const project = process.env.GOOGLE_CLOUD_PROJECT || 'propflow-ai-483621';
const location = 'us-east5';
const vertex_ai = new VertexAI({ project: project, location: location });

// Specialized model for reasoning and extraction
const model = "gemini-1.5-pro-001";

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
 * Clean Markdown JSON block if present
 */
function cleanJsonOutput(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json/, '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```/, '').replace(/```$/, '');
    }
    return clean;
}

/**
 * Parse document using Vertex AI (Gemini)
 */
export async function parseDocument(
    fileBuffer: Buffer,
    mimeType: string
): Promise<ParsedDocument> {
    try {
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: {
                'maxOutputTokens': 8192,
                'temperature': 0.1, // Low temp for extraction consistency
                'topP': 0.95,
            },
        });

        // Prepare content part based on mime type
        let contentPart: { text: string } | { inlineData: { mimeType: string; data: string } };
        let documentType: ParsedDocument['documentType'] = 'unknown';
        let rawContentForLog = '';

        if (mimeType.startsWith('image/')) {
            contentPart = {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType
                }
            };
        } else if (mimeType === 'application/pdf') {
            // Extract text for efficiency if PDF, or pass as base64 if needed for visual structure. 
            // Gemini 1.5 Pro can handle PDFs directly via API, but Node SDK might prefer base64 data part.
            // We will stick to the previous hybrid approach: extract text if mostly text, but using Vision would be better for complex docs.
            // For consistency with Gemini Upgrade: pass as PDF blob. 
            contentPart = {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType
                }
            };
        } else if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/csv' || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            // For text/spreadsheets, we extract content first
            let rawText = '';
            if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
                const XLSX = await import('xlsx');
                const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                rawText = XLSX.utils.sheet_to_csv(worksheet).substring(0, 30000); // 30k char limit safe for Gemini
            } else {
                rawText = fileBuffer.toString('utf-8').substring(0, 30000);
            }
            contentPart = { text: rawText };
            rawContentForLog = rawText.substring(0, 100) + '...';
        } else {
            // Default fall back
            contentPart = {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType
                }
            };
        }

        // 1. Classify Document
        const classificationReq = {
            contents: [{ role: 'user', parts: [{ text: DOCUMENT_CLASSIFICATION_PROMPT }, contentPart] }]
        };

        const classResult = await generativeModel.generateContent(classificationReq);
        const classResponse = await classResult.response;
        const classText = classResponse.candidates?.[0].content.parts[0].text;

        documentType = (cleanJsonOutput(classText || '').trim().toLowerCase() || 'unknown') as ParsedDocument['documentType'];
        console.log(`[VertexAI] Classified as: ${documentType}`);

        // 2. Extract Data
        const extractionPrompt = buildExtractionPrompt(documentType);

        const extractReq = {
            contents: [{
                role: 'user', parts: [
                    { text: extractionPrompt + "\n\nIMPORTANT: Return ONLY valid JSON." },
                    contentPart
                ]
            }]
        };

        const extractResult = await generativeModel.generateContent(extractReq);
        const extractResponse = await extractResult.response;
        const extractText = extractResponse.candidates?.[0].content.parts[0].text || '{}';

        const cleanedJson = cleanJsonOutput(extractText);
        const parsedData = JSON.parse(cleanedJson);

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
            rawText: rawContentForLog || 'Binary Content Processed',
        };

    } catch (error) {
        console.error('Error parsing document with Vertex AI:', error instanceof Error ? error.message : error);
        if (error instanceof Error && error.stack) console.error(error.stack);
        throw new Error('Failed to parse document with AI: ' + (error instanceof Error ? error.message : String(error)));
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
