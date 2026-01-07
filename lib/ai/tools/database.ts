
import { z } from "zod";
import { prisma } from "@/lib/prisma"; // Assuming standard Next.js usage

export const DATABASE_TOOL_DEF = {
    name: "database_query",
    description: `Query the database directly to verify tenant or property information.
    Use this when you need accurate data about leases, payments, or maintenance requests.
    Supported Tables: User, TenantProfile, Lease, Property, MaintenanceRequest, CommunicationLog.
    Operations: 'findUnique', 'findMany', 'count'.
    `,
    parameters: {
        type: "object",
        properties: {
            model: { type: "string", enum: ["User", "TenantProfile", "Lease", "Property", "MaintenanceRequest", "CommunicationLog"] },
            operation: { type: "string", enum: ["findUnique", "findMany", "count"] },
            query: { type: "string", description: "JSON stringified query object (where, include, etc.)" }
        },
        required: ["model", "operation", "query"]
    }
};

export async function handleDatabaseTool(args: any) {
    try {
        const model = args.model;
        const query = JSON.parse(args.query);

        // @ts-ignore - Dynamic key access
        const result = await prisma[model.charAt(0).toLowerCase() + model.slice(1)][args.operation](query);

        return JSON.stringify(result, null, 2);
    } catch (error) {
        return JSON.stringify({ error: "Database operation failed: " + (error as Error).message });
    }
}
