

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

export async function handleDatabaseTool(args: Record<string, unknown>) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { model, operation, query: queryString } = args as any;
        const query = JSON.parse(queryString);

        // Security: Enforce a limit on findMany if not provided to prevent DoS
        if (operation === 'findMany' && typeof query === 'object' && query !== null && !('take' in query)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (query as any).take = 10;
        }

        // @ts-expect-error - Dynamic key access is intentionally loose here for the tool
        const result = await prisma[model.charAt(0).toLowerCase() + model.slice(1)][operation](query);

        return JSON.stringify(result, null, 2);
    } catch (error) {
        console.error("Database Tool Internal Error:", error);
        return JSON.stringify({
            error: "Database operation failed",
            message: (error as Error).message,
            stack: (error as Error).stack?.split('\n').slice(0, 3).join('\n') // Limit stack trace
        }, null, 2);
    }
}
