import { checkRateLimit } from './rate-limiter';
import { sendSecurityAlert } from './alert-service';

/**
 * Heuristics for detecting suspicious activity beyond simple rate limits
 */

// Track failed authentications by IP
const failedAuthMap = new Map<string, { count: number; lastAttempt: number }>();
// const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 10; // 10 failed login attempts in a window

export async function checkSuspiciousActivity(
    req: Request,
    ip: string
): Promise<{ blocked: boolean; reason?: string }> {
    const url = new URL(req.url);
    const path = url.pathname;

    // 1. Check for blocked IP (from previous detection)
    // In a real system, we'd check a Redis 'blocked_ips' set.
    // Here we assume if they hit a harsh rate limit recently, they might be in a temporary block list 
    // (not implemented in memory for this simple version, relying on rate limiter)

    // 2. Sensitive Endpoint Protection
    // Admin routes or sensitive data exports should have stricter limits
    if (path.startsWith('/api/admin') || path.includes('/export')) {
        const strictResult = checkRateLimit(ip, {
            limit: 20, // Strict: 20 req/min
            windowMs: 60 * 1000,
            burst: 20
        });

        if (!strictResult.allowed) {
            // Alert on sensitive endpoint abuse
            if (Math.random() < 0.1) { // Throttle internal logic slightly
                await sendSecurityAlert({
                    type: 'SENSITIVE_ENDPOINT_ABUSE',
                    description: `High traffic to sensitive endpoint ${path} from ${ip}`,
                    sourceIp: ip,
                    severity: 'WARNING'
                });
            }
            return { blocked: true, reason: 'Rate limit exceeded for sensitive endpoint' };
        }
    }

    // 3. Brute Force Detection (failed logins)
    // This function would be called manually by auth endpoints (e.g. login route) on failure.
    // For general middleware, we can check for rapid 401s if we had response access, 
    // but middleware runs BEFORE response. 
    // So this is a utility exposed for the login handler.

    return { blocked: false };
}

/**
 * Report a failed authentication attempt
 * To be called by login handler or similar
 */
export async function reportFailedAuth(ip: string, email?: string) {
    const entry = failedAuthMap.get(ip) || { count: 0, lastAttempt: Date.now() };
    const now = Date.now();

    // Reset if window passed (e.g. 1 hour)
    if (now - entry.lastAttempt > 60 * 60 * 1000) {
        entry.count = 0;
    }

    entry.count++;
    entry.lastAttempt = now;
    failedAuthMap.set(ip, entry);

    if (entry.count === MAX_FAILED_ATTEMPTS) {
        await sendSecurityAlert({
            type: 'BRUTE_FORCE_ATTEMPT',
            description: `Detected 10 failed login attempts from ${ip} targeting ${email || 'unknown users'}`,
            sourceIp: ip,
            severity: 'CRITICAL',
            metadata: { email }
        });
    }
}
