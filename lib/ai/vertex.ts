import {
    VertexAI,
    GenerativeModel,
    ChatSession,
    Content,
    Part,
} from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

const project = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'propflow-ai-483621';
// Use us-central1 for Vertex AI (Gemini models available in this region)
// Separate from GCP_REGION which is used for Cloud Run (us-east4)

const location = process.env.VERTEX_AI_REGION || 'us-central1';

// Initialize Vertex AI with API key or credentials
const vertexConfig: any = {
    project,
    location,
};

// If API key is provided, use it
if (process.env.VERTEX_AI_API_KEY) {
    // Vertex AI SDK doesn't directly support API keys, but we can pass it via headers
    // This will be used in the HTTP requests
    vertexConfig.apiKey = process.env.VERTEX_AI_API_KEY;
} else if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
    // Fallback to service account credentials
    vertexConfig.googleAuthOptions = {
        credentials: {
            client_email: process.env.GCP_CLIENT_EMAIL,
            private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
    };
}

const vertexAI = new VertexAI(vertexConfig);

/**
 * Gemini models for different use cases
 */
export const models = {
    pro: 'gemini-1.5-pro',
    flash: 'gemini-1.5-flash',
    embeddings: 'text-embedding-004',
    // Custom endpoint models
    gemma: 'gemma-1.1-2b-it',
};

/**
 * Unified Vertex AI Service for Propflow
 */
export class VertexService {
    private static instance: VertexService;
    public generativeModel: GenerativeModel;
    private flashModel: GenerativeModel;
    private auth: GoogleAuth;

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

        // Initialize Google Auth for custom endpoint calls
        const authOptions: any = {
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        };

        if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
            authOptions.credentials = {
                client_email: process.env.GCP_CLIENT_EMAIL,
                private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        }

        this.auth = new GoogleAuth(authOptions);
    }

    public static getInstance(): VertexService {
        if (!VertexService.instance) {
            VertexService.instance = new VertexService();
        }
        return VertexService.instance;
    }

    /**
     * Generates text content using Gemma 2B (default) or Gemini
     * Defaults to Gemma as it is the deployed custom model for this project.
     */
    async generateText(prompt: string | Array<string | Part>, useGemma = true): Promise<string> {
        // Default to Gemma
        if (useGemma) {
            const endpointId = process.env.VERTEX_AI_ENDPOINT_ID;
            if (endpointId) {
                const textPrompt = Array.isArray(prompt)
                    ? prompt.map(p => typeof p === 'string' ? p : p.text).join('\n')
                    : prompt;
                return this.predictGemma(textPrompt);
            } else {
                console.warn('Gemma endpoint not configured, falling back to Gemini (may be blocked)');
            }
        }

        // Fallback to Gemini (Likely blocked for this project)
        const parts: Part[] = Array.isArray(prompt)
            ? prompt.map(p => typeof p === 'string' ? { text: p } : p)
            : [{ text: prompt }];

        const request = {
            contents: [{ role: 'user', parts }],
        };

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (this.generativeModel as any).generateContent(request as any);
            const response = await result.response;
            return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            console.error('Gemini Generation Error (Project may lack access):', error);
            throw new Error('Gemini model access is restricted. Please use Gemma.');
        }
    }

    /**
     * Calls a custom Vertex AI Endpoint (e.g. for Gemma)
     */
    private async predictGemma(prompt: string): Promise<string> {
        const endpointId = process.env.VERTEX_AI_ENDPOINT_ID;
        const predictionRegion = process.env.VERTEX_AI_PREDICTION_REGION || 'us-east4';

        if (!endpointId) throw new Error('VERTEX_AI_ENDPOINT_ID is not configured');

        try {
            const client = await this.auth.getClient();
            const accessToken = await client.getAccessToken();

            const predictionHost = process.env.VERTEX_AI_PREDICTION_HOST || `${predictionRegion}-aiplatform.googleapis.com`;
            const url = `https://${predictionHost}/v1/projects/${project}/locations/${predictionRegion}/endpoints/${endpointId}:predict`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [{
                        prompt: prompt,
                        max_tokens: 1024,
                        temperature: 0.5,
                        top_p: 1.0,
                        top_k: 40
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vertex AI Endpoint Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            // Gemma response format typically includes predictions array
            // Adjust parsing based on actual response structure from Model Garden
            if (data.predictions && data.predictions.length > 0) {
                let text = data.predictions[0];
                if (typeof text !== 'string') {
                    text = JSON.stringify(text); // Fallback if not string
                }

                // Clean up the response: Remove the input prompt if echoed back
                // Observed pattern: "Prompt: [prompt text] Output: [response]"
                // We will use a regex to aggressively strip this pattern

                // 1. Remove "Prompt: ... Output:" pattern if present
                text = text.replace(/^Prompt:[\s\S]*?Output:\s*/i, '');

                // 2. Remove "Answer:" or "Response:" prefixes
                text = text
                    .replace(/^Answer:\s*/i, '')
                    .replace(/^\*\*Answer:\*\*\s*/i, '')
                    .replace(/^Response:\s*/i, '')
                    .replace(/^\*\*Response:\*\*\s*/i, '')
                    .replace(/^Gemma:\s*/i, '')
                    .replace(/^Model:\s*/i, '')
                    .trim();

                // 3. Fallback: If it still starts with the prompt text (without the Prompt: label)
                const normalizedText = text.replace(/\s+/g, ' ').trim();
                const normalizedPrompt = prompt.replace(/\s+/g, ' ').trim();

                if (normalizedText.startsWith(normalizedPrompt)) {
                    // Try to strip exact prompt
                    if (text.startsWith(prompt)) {
                        text = text.substring(prompt.length).trim();
                    } else {
                        // Fuzzy strip using length
                        // This is risky if formatting differs greatly, but better than showing prompt
                        // We'll trust the regex above caught the structural echoing
                    }
                }

                return text;
            }

            return '';
        } catch (error) {
            console.error('Error calling Gemma endpoint:', error);
            throw error;
        }
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
