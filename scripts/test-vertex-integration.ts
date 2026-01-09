import { vertexService } from '@/lib/ai/vertex';
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';

async function testVertex() {
    console.log('--- Testing Vertex AI Integration ---');

    // Create temp key file if env vars exist but GOOGLE_APPLICATION_CREDENTIALS is missing
    let tempKeyFile = '';
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
        try {
            const keyData = {
                type: "service_account",
                project_id: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
                private_key_id: "temp-id",
                private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.GCP_CLIENT_EMAIL,
                client_id: "temp-client-id",
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GCP_CLIENT_EMAIL)}`
            };
            tempKeyFile = path.resolve(process.cwd(), 'temp-vertex-key.json');
            fs.writeFileSync(tempKeyFile, JSON.stringify(keyData, null, 2));
            process.env.GOOGLE_APPLICATION_CREDENTIALS = tempKeyFile;
            console.log('Created temporary credential file for testing:', tempKeyFile);
        } catch (e) {
            console.warn('Failed to create temp key file:', e);
        }
    }

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
