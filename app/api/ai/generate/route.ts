import { NextRequest, NextResponse } from 'next/server';
import { vertexService } from '@/lib/ai/vertex';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, model = 'gemini' } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Determine which model to use
        // Defaults to 'gemma' as it is the enabled model
        const useGemma = model !== 'gemini';

        // Call VertexService
        const result = await vertexService.generateText(prompt, useGemma);

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
