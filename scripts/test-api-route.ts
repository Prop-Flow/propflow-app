import 'dotenv/config';
import { POST } from '../app/api/ai/generate/route';
import { NextRequest } from 'next/server';

async function testApiRoute() {
    console.log('--- Testing API Route Logic ---');

    console.log('\n1. Testing Gemma Request...');
    // Create a mock request for Gemma
    const gemmaReq = new NextRequest('http://localhost/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
            prompt: 'What is the capital of France?',
            model: 'gemma'
        })
    });

    try {
        const response = await POST(gemmaReq);
        const data = await response.json();

        console.log('Status:', response.status);
        if (response.status === 200) {
            console.log('✅ Gemma Success:', data.result.substring(0, 50) + '...');
        } else {
            console.error('❌ Gemma Failed:', data);
        }
    } catch (error) {
        console.error('❌ Gemma Exception:', error);
    }

    console.log('\n2. Testing Missing Prompt Error...');
    const invalidReq = new NextRequest('http://localhost/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ model: 'gemma' })
    });

    try {
        const response = await POST(invalidReq);
        const data = await response.json();

        console.log('Status:', response.status);
        if (response.status === 400) {
            console.log('✅ Error Handling Success:', data.error);
        } else {
            console.error('❌ Error Handling Failed:', data);
        }
    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

testApiRoute();
