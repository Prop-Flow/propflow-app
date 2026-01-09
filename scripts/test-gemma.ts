import * as dotenv from 'dotenv';
dotenv.config();
import { vertexService } from '@/lib/ai/vertex';

async function testGemma() {
    console.log('--- Testing Gemma Integration ---');
    console.log('Endpoint ID:', process.env.VERTEX_AI_ENDPOINT_ID);
    console.log('Region:', process.env.VERTEX_AI_PREDICTION_REGION);

    try {
        console.log('\nTesting Gemma generation...');
        const prompt = 'What are the key benefits of real estate property management?';
        const response = await vertexService.generateText(prompt, true); // true for useGemma

        console.log('✅ Gemma Response:', response);
    } catch (error) {
        console.error('❌ Gemma Test Failed:', error);
    }
}

testGemma();
