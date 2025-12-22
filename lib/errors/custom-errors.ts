/**
 * Custom Error Classes
 * Provides type-safe error handling with appropriate HTTP status codes
 */

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', public details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Sanitize error for client response
 * Prevents information leakage in production
 */
export function sanitizeError(error: unknown): { message: string; code?: string } {
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code,
        };
    }

    if (error instanceof Error) {
        // In development, show full error
        if (process.env.NODE_ENV === 'development') {
            return { message: error.message };
        }
    }

    // Production: generic message only
    return { message: 'An unexpected error occurred' };
}

/**
 * Log error securely without exposing sensitive data
 */
export function logError(error: unknown, context?: string) {
    const prefix = context ? `[${context}]` : '';

    if (error instanceof AppError) {
        console.error(`${prefix} ${error.name}:`, error.message, error.code);
    } else if (error instanceof Error) {
        console.error(`${prefix} Error:`, error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    } else {
        console.error(`${prefix} Unknown error:`, error);
    }
}
