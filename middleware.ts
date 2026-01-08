import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { checkSuspiciousActivity } from '@/lib/security/suspicious-activity';
import { sendSecurityAlert } from '@/lib/security/alert-service';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const path = req.nextUrl.pathname;

    // 1. Exclude static assets and health checks
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/favicon.ico') ||
        path.startsWith('/debug-auth') || // Allow debug page
        path.includes('.') // likely a file extension ||
    ) {
        return NextResponse.next();
    }

    // 2. Suspicious Activity Check (Blocking)
    const suspicionResult = await checkSuspiciousActivity(req, ip);
    if (suspicionResult.blocked) {
        return new NextResponse(
            JSON.stringify({ error: suspicionResult.reason || 'Access denied' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 3. Global API Rate Limiting (Loose)
    // Only apply to /api routes
    if (path.startsWith('/api')) {
        // Stricter rate limiting for authentication endpoints
        let rateLimit;
        if (path.includes('/api/auth/callback/credentials') || path.includes('/api/auth/signin')) {
            // Auth endpoints: 5 attempts per 15 minutes
            rateLimit = checkRateLimit(ip, {
                limit: 5,
                windowMs: 15 * 60 * 1000,
                burst: 5
            });
        } else if (path.includes('/api/auth/signup') || path.includes('/register')) {
            // Signup: 3 attempts per hour
            rateLimit = checkRateLimit(ip, {
                limit: 3,
                windowMs: 60 * 60 * 1000,
                burst: 3
            });
        } else {
            // Default: 100 req/min
            rateLimit = checkRateLimit(ip);
        }

        const response = NextResponse.next();

        // Inject security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Inject rate limit headers
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

        if (!rateLimit.allowed) {
            // Rate limit exceeded

            // Alert dev on rejection (indicates likely script/abuse)
            await sendSecurityAlert({
                type: 'RATE_LIMIT_EXCEEDED',
                description: `IP ${ip} exceeded API rate limit requesting ${path}`,
                sourceIp: ip,
                severity: 'WARNING'
            });

            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        return response;
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
