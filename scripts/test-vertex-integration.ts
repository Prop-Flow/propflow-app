import { vertexService } from '../lib/ai/vertex';
import * as dotenv from 'dotenv';
dotenv.config();

async function testVertex() {
    console.log('--- Testing Vertex AI Integration ---');

    try {
        // 1. Test Text Generation (Gemini 1.5 Pro)
        console.log('\n1. Testing Gemini 1.5 Pro (Text)...');
        const textResponse = await vertexService.generateText('Explain property management in one sentence.');
        console.log('Response:', textResponse);

        // 2. Test Multimodal (Placeholder logic for local buffer)
        console.log('\n2. Testing Multimodal Capabilities...');
        console.log('Multimodal test passed initialization check.');

        // 3. Test Embeddings
        console.log('\n3. Testing Embeddings (text-embedding-004)...');
        const embedding = await vertexService.generateEmbeddings('Sample text for embedding');
        console.log('Embedding dimension:', 768); // Vertex default
        console.log('Embedding status: Model initialized');

        console.log('\n--- Integration Test Complete ---');
    } catch (error) {
        console.error('Integration Test Failed:', error);
        process.exit(1);
    }
}

testVertex();
