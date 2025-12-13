import { put } from '@vercel/blob';

export interface UploadedDocument {
    url: string;
    pathname: string;
    contentType: string;
    size: number;
}

/**
 * Upload document to Vercel Blob storage
 */
export async function uploadDocument(
    file: File | Buffer,
    fileName: string,
    contentType: string
): Promise<UploadedDocument> {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            throw new Error('Blob storage not configured');
        }

        const blob = await put(fileName, file, {
            access: 'public',
            contentType,
        });

        return {
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            size: 0, // Size not available in response
        };
    } catch (error) {
        console.error('Error uploading document:', error);
        throw new Error('Failed to upload document');
    }
}

/**
 * Detect document type from filename or content
 */
export function detectDocumentType(fileName: string): 'lease' | 'application' | 'id' | 'w9' | 'unknown' {
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('lease') || lowerName.includes('rental agreement')) {
        return 'lease';
    }
    if (lowerName.includes('application') || lowerName.includes('apply')) {
        return 'application';
    }
    if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
        return 'id';
    }
    if (lowerName.includes('w-9') || lowerName.includes('w9') || lowerName.includes('tax')) {
        return 'w9';
    }

    return 'unknown';
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/heic',
    ];

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size must be less than 10MB',
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'File type must be PDF, PNG, JPG, or HEIC',
        };
    }

    return { isValid: true };
}
