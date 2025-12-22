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
        path.includes('.') // likely a file extension
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
        const rateLimit = checkRateLimit(ip); // Uses default config (100 req/min)

        const response = NextResponse.next();

        // Inject rate limit headers
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

        if (!rateLimit.allowed) {
            // Rate limit exceeded

            // Alert dev on rejection (indicates likely script/abuse)
            await sendSecurityAlert({
                type: 'RATE_LIMIT_EXCEEDED',
                description: `IP ${ip} exceeded global API rate limit requesting ${path}`,
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
