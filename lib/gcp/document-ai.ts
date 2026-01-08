import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

/**
 * Google Cloud Document AI Service
 * Handles interaction with Document AI for processing documents
 */

// Initialize client
const client = new DocumentProcessorServiceClient();

export interface ProcessDocumentOptions {
    projectId?: string;
    location?: string;
    processorId: string;
    mimeType: string;
}

/**
 * Process a document using Google Cloud Document AI
 * @param fileBuffer - The buffer of the file to process
 * @param options - Configuration options for the request
 * @returns The processed document object
 */
export async function processDocument(
    fileBuffer: Buffer,
    options: ProcessDocumentOptions
) {
    const {
        projectId = process.env.GOOGLE_CLOUD_PROJECT || 'propflow-ai-483621',
        location = 'us-east5',
        processorId,
        mimeType,
    } = options;

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const request = {
        name,
        rawDocument: {
            content: fileBuffer.toString('base64'),
            mimeType,
        },
    };

    try {
        const [result] = await client.processDocument(request);
        const { document } = result;
        return document;
    } catch (error) {
        console.error('Error processing document with Document AI:', error);
        throw new Error('Failed to process document');
    }
}
