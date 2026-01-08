import { db } from "@/lib/services/firebase-admin";

export const DATABASE_TOOL_DEF = {
    name: "database_query",
    description: `Query the Firestore database directly to verify tenant or property information.
    Use this when you need accurate data about leases, payments, or maintenance requests.
    Collections: properties, tenants, leases, maintenanceRequests, communicationLogs.
    Operations: 'getDoc', 'getDocs', 'count'.
    `,
    parameters: {
        type: "object",
        properties: {
            collection: { type: "string", enum: ["properties", "tenants", "leases", "maintenanceRequests", "communicationLogs"] },
            operation: { type: "string", enum: ["getDoc", "getDocs", "count"] },
            query: { type: "string", description: "JSON stringified query object (id for getDoc, or filters/limit for getDocs)" }
        },
        required: ["collection", "operation", "query"]
    }
};

export async function handleDatabaseTool(args: Record<string, unknown>) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { collection, operation, query: queryString } = args as any;
        const query = JSON.parse(queryString);

        const collectionRef = db.collection(collection);

        if (operation === 'getDoc') {
            if (!query.id) throw new Error("ID is required for getDoc");
            const doc = await collectionRef.doc(query.id).get();
            return JSON.stringify({ id: doc.id, ...doc.data() }, null, 2);
        }

        if (operation === 'getDocs') {
            let firestoreQuery: FirebaseFirestore.Query = collectionRef;

            // Basic filtering implementation if provided
            if (query.where) {
                for (const [key, value] of Object.entries(query.where)) {
                    firestoreQuery = firestoreQuery.where(key, '==', value);
                }
            }

            const limit = query.limit || 10;
            const snapshot = await firestoreQuery.limit(limit).get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return JSON.stringify(docs, null, 2);
        }

        if (operation === 'count') {
            const snapshot = await collectionRef.count().get();
            return JSON.stringify({ count: snapshot.data().count });
        }

        return "Unsupported operation";
    } catch (error) {
        console.error("Database Tool Internal Error (Firestore):", error);
        return JSON.stringify({
            error: "Firestore operation failed",
            message: (error as Error).message
        }, null, 2);
    }
}
