import { Pinecone } from '@pinecone-database/pinecone';
import { VertexAI } from '@google-cloud/vertexai';

const project = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'propflow-ai-483621';
// Use us-central1 for Vertex AI (same as vertex.ts)
const location = process.env.VERTEX_AI_REGION || 'us-central1';
const vertexAI = new VertexAI({ project, location });

let pineconeClient: Pinecone | null = null;

/**
 * Initialize Pinecone client
 */
function getPineconeClient(): Pinecone {
    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        });
    }
    return pineconeClient;
}

/**
 * Generate embeddings for text using Vertex AI (text-embedding-004)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = vertexAI.getGenerativeModel({ model: 'text-embedding-004' });

        // Use the native embedContent method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (model as any).embedContent({
            content: { role: 'user', parts: [{ text }] }
        });

        const embedding = result.predictions?.[0]?.embeddings?.values;
        if (!embedding) {
            throw new Error('No embedding returned from Vertex AI');
        }

        return embedding;
    } catch (error) {
        console.error('Error generating embedding with Vertex AI:', error);
        throw error;
    }
}

/**
 * Store tenant interaction in vector database
 */
export async function storeTenantInteraction(
    tenantId: string,
    interaction: {
        message: string;
        channel: string;
        timestamp: Date;
        metadata?: Record<string, unknown>;
    }
): Promise<void> {
    try {
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
            // console.warn('Pinecone not configured, skipping vector storage');
            return;
        }

        const pinecone = getPineconeClient();
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

        const embedding = await generateEmbedding(interaction.message);

        await index.upsert([
            {
                id: `${tenantId} -${Date.now()} `,
                values: embedding,
                metadata: {
                    tenantId,
                    message: interaction.message,
                    channel: interaction.channel,
                    timestamp: interaction.timestamp.toISOString(),
                    ...interaction.metadata,
                },
            },
        ]);
    } catch (error) {
        console.error('Error storing tenant interaction:', error);
        // Don't throw - vector storage is not critical
    }
}

/**
 * Retrieve relevant context for a tenant from vector database
 */
export async function getTenantContext(
    tenantId: string,
    query: string,
    topK: number = 5
): Promise<Array<{ message: string; channel: string; timestamp: string }>> {
    try {
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
            // console.warn('Pinecone not configured, returning empty context');
            return [];
        }

        const pinecone = getPineconeClient();
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

        const queryEmbedding = await generateEmbedding(query);

        const results = await index.query({
            vector: queryEmbedding,
            topK,
            filter: { tenantId },
            includeMetadata: true,
        });

        return results.matches.map((match) => ({
            message: (match.metadata as Record<string, string>)?.message || '',
            channel: (match.metadata as Record<string, string>)?.channel || '',
            timestamp: (match.metadata as Record<string, string>)?.timestamp || '',
        }));
    } catch (error) {
        console.error('Error retrieving tenant context:', error);
        return [];
    }
}

/**
 * Store property information in vector database
 */
export async function storePropertyInfo(
    propertyId: string,
    info: {
        name: string;
        address: string;
        details: string;
    }
): Promise<void> {
    try {
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
            // console.warn('Pinecone not configured, skipping vector storage');
            return;
        }

        const pinecone = getPineconeClient();
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

        const text = `${info.name} - ${info.address}: ${info.details} `;
        const embedding = await generateEmbedding(text);

        await index.upsert([
            {
                id: `property - ${propertyId} `,
                values: embedding,
                metadata: {
                    propertyId,
                    type: 'property',
                    name: info.name,
                    address: info.address,
                    details: info.details,
                },
            },
        ]);
    } catch (error) {
        console.error('Error storing property info:', error);
    }
}
