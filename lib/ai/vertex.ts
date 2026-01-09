
export const vertexService = {
    generateText: async (prompt: string, useGemma: boolean = false): Promise<string> => {
        console.log(`[Mock] Generating text with prompt: ${prompt} (Gemma: ${useGemma})`);
        throw new Error("Vertex AI not configured in this environment");
    },
    generateEmbeddings: async (text: string): Promise<number[]> => {
        console.log(`[Mock] Generating embeddings for: ${text}`);
        throw new Error("Vertex AI not configured in this environment");
    }
};
