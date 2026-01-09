import { useState, useCallback } from 'react';

type AIModel = 'gemini' | 'gemma';

interface GenerateOptions {
    model?: AIModel;
    context?: string; // Optional context for future system prompt enhancements
}

interface UseAIResult {
    generate: (prompt: string, options?: GenerateOptions) => Promise<string>;
    isLoading: boolean;
    error: string | null;
    result: string | null;
    reset: () => void;
}

/**
 * Hook to consume the centralized AI API.
 * Allows easy switching between Gemini (default) and Gemma models.
 */
export function useAI(): UseAIResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setResult(null);
    }, []);

    const generate = useCallback(async (prompt: string, options: GenerateOptions = {}) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    model: options.model || 'gemma',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate content');
            }

            setResult(data.result);
            return data.result;
        } catch (err: any) {
            const message = err.message || 'An unexpected error occurred';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        generate,
        isLoading,
        error,
        result,
        reset,
    };
}
