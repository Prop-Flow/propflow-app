import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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

        const tenant = await prisma.tenant.findUnique({
            where: { userId: user.id }
        });

        if (!tenant) {
            return new NextResponse("Tenant profile not found", { status: 403 });
        }

        const json = await req.json();
        const body = contactSchema.parse(json);

        // TODO: Re-implement logging with a new simplified model if needed
        console.log(`Contact message from tenant ${tenant.id}:`, body);

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
