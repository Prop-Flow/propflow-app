import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const AI_CORE_URL = process.env.AI_CORE_SERVICE_URL || 'http://localhost:8080';

    try {
        const body = await req.json();
        const { prompt, model = 'gemini' } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${AI_CORE_URL}/generate`, {
            method: 'POST',
            body: JSON.stringify({ prompt, model }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`AI Core responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error('AI Generation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
