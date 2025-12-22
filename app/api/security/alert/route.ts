
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/communication/email-service';
// import { prisma } from '@/lib/prisma'; // Removed unused import

export async function POST(req: Request) {
    try {
        const alert = await req.json();
        const { type, description, sourceIp, severity, metadata } = alert;

        // 1. Log to DB
        // Using console for now as placeholder for real security log table, or reusing communication log if appropriate
        console.warn(`SECURITY EVENT [${severity}]: ${type} - ${description} (${sourceIp})`, metadata);

        // Example: Log to a hypothetical SecurityLog table if it existed
        // await prisma.securityLog.create({ ... });

        // 2. Send Email if critical/warning
        if (severity === 'CRITICAL' || severity === 'WARNING') {
            const devEmails = process.env.DEVELOPER_EMAILS?.split(',') || ['admin@propflow.ai'];
            if (devEmails.length > 0) {
                await sendEmail(
                    devEmails[0].trim(),
                    `[${severity}] Security Alert: ${type}`,
                    description,
                    'system_security'
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in security alert API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
