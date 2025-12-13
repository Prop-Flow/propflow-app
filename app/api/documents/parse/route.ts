import { NextRequest, NextResponse } from 'next/server';
import { parseDocument, validateExtractedData } from '@/lib/ai/document-parser';
import { uploadDocument } from '@/lib/documents/upload';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse document with AI
        const parsed = await parseDocument(buffer, file.type, file.name);

        // Validate extracted data
        const validation = validateExtractedData(parsed.extractedData);

        // Upload document to storage (optional - can be done after tenant creation)
        let documentUrl = null;
        try {
            const uploaded = await uploadDocument(buffer, file.name, file.type);
            documentUrl = uploaded.url;
        } catch (uploadError) {
            console.warn('Document upload failed, continuing without storage:', uploadError);
        }

        // Create temporary document record
        const document = await prisma.document.create({
            data: {
                tenantId: 'temp', // Will be updated when tenant is created
                type: parsed.documentType,
                name: file.name,
                status: 'pending',
                fileUrl: documentUrl,
                extractedData: JSON.stringify(parsed.extractedData),
                confidence: parsed.overallConfidence,
                processingStatus: 'completed',
            },
        });

        return NextResponse.json({
            success: true,
            documentId: document.id,
            documentType: parsed.documentType,
            extractedData: parsed.extractedData,
            overallConfidence: parsed.overallConfidence,
            validation,
            documentUrl,
        });

    } catch (error: any) {
        console.error('Error parsing document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to parse document' },
            { status: 500 }
        );
    }
}
