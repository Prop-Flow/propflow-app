/**
 * Centralized error handling utility
 * Provides consistent error messages and logging
 */

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
}

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        // Map common errors to user-friendly messages
        if (error.message.includes('fetch')) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        if (error.message.includes('not found')) {
            return 'The requested resource was not found.';
        }
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string) {
    const prefix = context ? `[${context}]` : '';
    console.error(`${prefix} Error:`, error);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to Sentry, LogRocket, etc.
    }
}

/**
 * Handle API fetch errors
 */
export async function handleApiError(response: Response): Promise<never> {
    let errorMessage = 'Request failed';

    try {
        const data = await response.json();
        errorMessage = data.error || data.message || errorMessage;
    } catch {
        // Response doesn't have JSON body
        errorMessage = response.statusText || errorMessage;
    }

    throw new AppError(errorMessage, response.status);
}

/**
 * Retry logic for failed requests
 */
export async function retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError;
}
