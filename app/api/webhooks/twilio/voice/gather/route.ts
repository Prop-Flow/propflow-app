import { NextRequest, NextResponse } from 'next/server';
import { processIVRResponse } from '@/lib/communication/voice-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const digits = body.get('Digits') as string;
        const callSid = body.get('CallSid') as string;

        if (!callSid) {
            return new NextResponse(
                `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, we encountered an error. Goodbye.</Say>
</Response>`,
                {
                    headers: { 'Content-Type': 'text/xml' },
                }
            );
        }

        const { action } = await processIVRResponse(callSid, digits);

        let twiml = '';

        if (action === 'confirmed') {
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for confirming. We appreciate your response. Goodbye.</Say>
</Response>`;
        } else if (action === 'escalate') {
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you. Your property manager will contact you shortly. Goodbye.</Say>
</Response>`;
        } else {
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We didn't receive a valid response. Please contact your property manager directly. Goodbye.</Say>
</Response>`;
        }

        return new NextResponse(twiml, {
            headers: { 'Content-Type': 'text/xml' },
        });
    } catch (error) {
        console.error('Error processing voice gather:', error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, we encountered an error. Goodbye.</Say>
</Response>`,
            {
                headers: { 'Content-Type': 'text/xml' },
            }
        );
    }
}
