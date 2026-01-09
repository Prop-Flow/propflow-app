import { NextResponse } from 'next/server';


export async function POST(req: Request) {
    try {
        const alert = await req.json();
        const { type, description, sourceIp, severity, metadata } = alert;

        // 1. Log to DB
        // Using console for now as placeholder for real security log table, or reusing communication log if appropriate
        console.warn(`SECURITY EVENT [${severity}]: ${type} - ${description} (${sourceIp})`, metadata);



        // 2. Send Email if critical/warning
        if (severity === 'CRITICAL' || severity === 'WARNING') {
            // TODO: Integrate new notification system
            console.warn(`[Mock Notification] Sending critical alert to admins: ${description}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in security alert API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
