import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors/custom-errors";
import { z } from "zod";

const maintenanceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    priority: z.enum(["low", "normal", "high", "emergency"]),
    category: z.string().optional(),
    location: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);
        // If getSessionUser throws UnauthorizedError, it will be caught below.

        // Find tenant profile
        const tenant = await prisma.tenant.findUnique({
            where: { userId: user.id },
            include: { property: true }
        });

        if (!tenant) {
            return new NextResponse("Tenant profile not found", { status: 403 });
        }

        const json = await req.json();
        const body = maintenanceSchema.parse(json);

        // Create ticket number
        const count = await prisma.maintenanceRequest.count({
            where: { propertyId: tenant.propertyId }
        });
        const ticketNumber = `REQ-${(count + 1).toString().padStart(4, '0')}`;

        const request = await prisma.maintenanceRequest.create({
            data: {
                ...body,
                status: "pending",
                ticketNumber,
                tenantId: tenant.id,
                propertyId: tenant.propertyId,
            },
        });

        // Notify Property Manager(s) - Basic Placeholder logic
        // We would look up managers of the property and create Notification records
        // for (const manager of tenant.property.managers) { ... }

        // Create 'CommunicationLog' entry for audit
        await prisma.communicationLog.create({
            data: {
                tenantId: tenant.id,
                channel: "portal",
                direction: "inbound",
                message: `New Maintenance Request: ${body.title} (${body.priority})`,
                status: "received",
                metadata: { requestId: request.id }
            }
        });

        return NextResponse.json(request);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: unknown }).code : null;

        if (errorCode === 'UNAUTHORIZED' || error instanceof UnauthorizedError) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        console.error("MAINTENANCE_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getSessionUser(req);

        const tenant = await prisma.tenant.findUnique({
            where: { userId: user.id }
        });

        if (!tenant) {
            return new NextResponse("Tenant profile not found", { status: 404 });
        }

        const requests = await prisma.maintenanceRequest.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: unknown }).code : null;

        if (errorCode === 'UNAUTHORIZED' || error instanceof UnauthorizedError) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        console.error("MAINTENANCE_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
