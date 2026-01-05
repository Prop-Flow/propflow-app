import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY || '');
    }
    return resendClient;
}

/**
 * Send email to tenant
 */
export async function sendEmail(
    to: string,
    subject: string,
    message: string,
    tenantId: string,
    html?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('Resend not configured, email not sent');
            return { success: false, error: 'Email service not configured' };
        }

        const resend = getResendClient();
        const emailData = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Propflow AI <noreply@propflow.ai>',
            to: [to],
            subject,
            text: message,
            html: html || generateEmailHTML(message),
        });

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`Email sent to ${to} for tenant ${tenantId}: ${subject}`);

        return {
            success: true,
            messageId: emailData.data?.id,
        };
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(message: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propflow AI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Propflow AI</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Property Management</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
      <p>This is an automated message from Propflow AI. Please do not reply directly to this email.</p>
      <p>If you have questions, please contact your property manager.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Process incoming email (webhook from email service)
 */
export async function processIncomingEmail(
    from: string,
    subject: string,
    body: string
): Promise<{ tenantId?: string; message: string }> {
    try {
        // Find tenant by email
        const tenant = await prisma.tenant.findFirst({
            where: {
                email: {
                    equals: from,
                },
            },
        });

        if (!tenant) {
            console.warn(`No tenant found for email: ${from}`);
            return {
                message: 'Tenant not found',
            };
        }

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`Incoming email from ${from} for tenant ${tenant.id}: ${subject}`);

        return {
            tenantId: tenant.id,
            message: body,
        };
    } catch (error) {
        console.error('Error processing incoming email:', error);
        throw error;
    }
}
