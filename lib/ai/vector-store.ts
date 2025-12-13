import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }
    return openaiClient;
}

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
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const openai = getOpenAIClient();
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
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
        metadata?: Record<string, any>;
    }
): Promise<void> {
    try {
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
            console.warn('Pinecone not configured, skipping vector storage');
            return;
        }

        const pinecone = getPineconeClient();
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

        const embedding = await generateEmbedding(interaction.message);

        await index.upsert([
            {
                id: `${tenantId}-${Date.now()}`,
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
            console.warn('Pinecone not configured, returning empty context');
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

        return results.matches.map((match: any) => ({
            message: match.metadata?.message || '',
            channel: match.metadata?.channel || '',
            timestamp: match.metadata?.timestamp || '',
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
            console.warn('Pinecone not configured, skipping vector storage');
            return;
        }

        const pinecone = getPineconeClient();
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

        const text = `${info.name} - ${info.address}: ${info.details}`;
        const embedding = await generateEmbedding(text);

        await index.upsert([
            {
                id: `property-${propertyId}`,
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
