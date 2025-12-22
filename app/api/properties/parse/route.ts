import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/ai/document-parser';

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
        const result = await parseDocument(buffer, file.type);

        return NextResponse.json({
            success: true,
            documentType: result.documentType,
            extractedData: result.extractedData,
            confidence: result.overallConfidence
        });

    } catch (error) {
        console.error('Error parsing property document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse document' },
            { status: 500 }
        );
    }
}
