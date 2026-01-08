import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase-admin";
import { getSessionUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors/custom-errors";
import { z } from "zod";

const contactSchema = z.object({
    topic: z.string(),
    message: z.string().min(1, "Message is required"),
    urgency: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);

        // Find tenant by userId in Firestore
        const tSnapshot = await db.collection('tenants')
            .where('userId', '==', user.id)
            .limit(1)
            .get();

        if (tSnapshot.empty) {
            return new NextResponse("Tenant profile not found", { status: 403 });
        }

        const tenantDoc = tSnapshot.docs[0];
        const json = await req.json();
        const body = contactSchema.parse(json);

        // Log communication to Firestore
        const logRef = db.collection('communication_logs').doc();
        await logRef.set({
            id: logRef.id,
            tenantId: tenantDoc.id,
            type: 'in_app',
            direction: 'INBOUND',
            subject: body.topic,
            content: body.message,
            metadata: { urgency: body.urgency },
            status: 'RECEIVED',
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: "Your message has been received." });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        if (error instanceof UnauthorizedError) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        console.error("CONTACT_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
