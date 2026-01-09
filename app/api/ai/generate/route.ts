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
    } catch (error: unknown) {
        console.error('AI Generation Error:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessage = (error as any).message || 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
