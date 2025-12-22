
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface SecurityAlert {
    type: string;
    description: string;
    sourceIp: string;
    severity: AlertSeverity;
    metadata?: Record<string, unknown>;
}

// Cache to prevent alert fatigue (max 1 email per type/IP per hour)
const alertCache = new Map<string, number>();
const ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour

/**
 * Send a security alert (Edge compatible - calls API)
 */
export async function sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    const { type, sourceIp, severity } = alert;

    if (severity === 'INFO') return;

    // Check cache
    const cacheKey = `${type}:${sourceIp}`;
    const now = Date.now();
    const lastSent = alertCache.get(cacheKey) || 0;

    if (now - lastSent < ALERT_COOLDOWN) {
        return;
    }

    // Call API route (fire and forget)
    // We use fetch without awaiting response to not block middleware too long
    // Note: In middleware, we must await if we want to ensure it sends, 
    // but usually we want to proceed fast. However, Edge runtime might cancel 
    // requests if not awaited. Best to await but with timeout.
    // For simplicity, we await.
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/security/alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert)
        });

        alertCache.set(cacheKey, now);
    } catch (err) {
        console.error('Failed to send security alert:', err);
    }
}

