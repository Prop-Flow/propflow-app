import { NextRequest } from 'next/server';
import { getSessionUser } from './lib/auth/session';

async function testAuth() {
    console.log('Testing getSessionUser...');
    try {
        const mockRequest = new NextRequest('http://localhost:3000/api/owner/stats', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });

        const user = await getSessionUser(mockRequest);
        console.log('User retrieved:', user);
    } catch (error) {
        console.error('Expected error or unexpected failure:', error.message);
    }
}

testAuth();
