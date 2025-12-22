/**
 * In-memory Token Bucket Rate Limiter
 * 
 * "Loose" implementation designed to be forgiving but strictly catch abuse.
 * - Stores state in memory (Map) -> Fast, but resets on server restart (acceptable for this use case)
 * - Token Bucket algorithm allows for bursts
 */

interface Bucket {
    tokens: number;
    lastRefill: number;
}

export interface RateLimitConfig {
    limit: number;      // Max requests allowed within window
    windowMs: number;   // Window size in ms
    burst?: number;     // Allow short bursts above limit (optional, defaults to limit)
}

// Default configuration: Loose limits
// 100 requests per minute per IP is generous for a normal user
const DEFAULT_CONFIG: RateLimitConfig = {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    burst: 150
};

const buckets = new Map<string, Bucket>();

// Cleanup interval to remove old IP entries (prevent memory leak)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

export function checkRateLimit(
    ip: string,
    config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; reset: number } {
    const now = Date.now();

    // Periodic cleanup of stale buckets
    if (now - lastCleanup > CLEANUP_INTERVAL) {
        cleanupBuckets(now, config.windowMs);
        lastCleanup = now;
    }

    let bucket = buckets.get(ip);

    if (!bucket) {
        bucket = {
            tokens: config.burst || config.limit,
            lastRefill: now
        };
        buckets.set(ip, bucket);
    } else {
        // Refill tokens based on time passed
        const timePassed = now - bucket.lastRefill;
        const refillRate = config.limit / config.windowMs; // tokens per ms
        const tokensToAdd = timePassed * refillRate;

        bucket.tokens = Math.min(
            (config.burst || config.limit),
            bucket.tokens + tokensToAdd
        );
        bucket.lastRefill = now;
    }

    // Consume token
    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;

        return {
            allowed: true,
            remaining: Math.floor(bucket.tokens),
            reset: now + config.windowMs // Approximate reset time
        };
    } else {
        return {
            allowed: false,
            remaining: 0,
            reset: bucket.lastRefill + (1 / (config.limit / config.windowMs)) // Time until next token
        };
    }
}

function cleanupBuckets(now: number, windowMs: number) {
    for (const [ip, bucket] of buckets.entries()) {
        if (now - bucket.lastRefill > windowMs * 2) {
            buckets.delete(ip);
        }
    }
}
