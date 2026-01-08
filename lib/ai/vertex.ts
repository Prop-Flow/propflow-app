import {
    VertexAI,
    GenerativeModel,
    ChatSession,
    Content,
    Part,
} from '@google-cloud/vertexai';

const project = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'propflow-ai-483621';
const location = process.env.GCP_REGION || 'us-east5';

// Initialize Vertex AI with explicit credentials support
const googleAuthOptions = (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY)
    ? {
        credentials: {
            client_email: process.env.GCP_CLIENT_EMAIL,
            private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
    }
    : undefined;

const vertexAI = new VertexAI({
    project,
    location,
    googleAuthOptions
});

/**
 * Gemini models for different use cases
 */
export const models = {
    pro: 'gemini-1.5-pro',
    flash: 'gemini-1.5-flash',
    embeddings: 'text-embedding-004',
};

/**
 * Unified Vertex AI Service for Propflow
 */
export class VertexService {
    private static instance: VertexService;
    public generativeModel: GenerativeModel;
    private flashModel: GenerativeModel;

    private constructor() {
        this.generativeModel = vertexAI.getGenerativeModel({
            model: models.pro,
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.7,
                topP: 0.95,
            },
        });

        this.flashModel = vertexAI.getGenerativeModel({
            model: models.flash,
        });
    }

    public static getInstance(): VertexService {
        if (!VertexService.instance) {
            VertexService.instance = new VertexService();
        }
        return VertexService.instance;
    }

    /**
     * Generates text content using Gemini 1.5 Pro
     */
    async generateText(prompt: string | Array<string | Part>): Promise<string> {
        const parts: Part[] = Array.isArray(prompt)
            ? prompt.map(p => typeof p === 'string' ? { text: p } : p)
            : [{ text: prompt }];

        const request = {
            contents: [{ role: 'user', parts }],
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (this.generativeModel as any).generateContent(request as any);
        const response = await result.response;
        return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * Generates embeddings using text-embedding-004
     */
    async generateEmbeddings(text: string): Promise<number[]> {
        // const model = vertexAI.preview.getGenerativeModel({ model: models.embeddings });
        // Vertex AI embeddings API is slightly different from content generation
        // This is a placeholder for the integrated flow in implementation
        console.log("Embedding requested for text length:", text.length);
        return [];
    }

    /**
     * Starts a chat session with memory
     */
    startChat(history: Content[] = []): ChatSession {
        return this.generativeModel.startChat({
            history,
        });
    }
}

export const vertexService = VertexService.getInstance();
