/**
 * Secure logging utility for production environments
 * Automatically sanitizes sensitive data and respects environment settings
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';

class SecureLogger {
    /**
     * Sanitize sensitive fields from objects
     */
    private sanitize(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        const sanitized = { ...obj };
        const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    /**
     * Log authentication events
     */
    auth(message: string, data?: any) {
        if (isProd) {
            // Production: minimal logging, no sensitive data
            console.log(`[Auth] ${message}`);
        } else {
            // Development: detailed logging with sanitized data
            console.log(`[Auth] ${message}`, data ? this.sanitize(data) : '');
        }
    }

    /**
     * Log API events
     */
    api(message: string, data?: any) {
        if (isProd) {
            console.log(`[API] ${message}`);
        } else {
            console.log(`[API] ${message}`, data ? this.sanitize(data) : '');
        }
    }

    /**
     * Log errors (always logged, but sanitized)
     */
    error(message: string, error?: any) {
        console.error(`[Error] ${message}`, error ? this.sanitize(error) : '');
    }

    /**
     * Debug logs (only in development)
     */
    debug(message: string, data?: any) {
        if (!isProd) {
            console.log(`[Debug] ${message}`, data ? this.sanitize(data) : '');
        }
    }

    /**
     * Check if we're in production
     */
    get isProduction() {
        return isProd;
    }
}

export const logger = new SecureLogger();
