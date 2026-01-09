
import { z } from 'zod';
// Mock logger
const logger = {
    auth: (msg: string) => console.log(`[Logger] ${msg}`),
    error: (msg: string, err: any) => console.error(`[Logger] ${msg}`, err)
};

async function authorize(credentials: any) {
    console.log('[Auth] Authorizing credentials:', {
        email: (credentials as any)?.email,
        hasPassword: !!(credentials as any)?.password
    });

    const parsedCredentials = z
        .object({ email: z.string().email(), password: z.string().min(6) })
        .safeParse(credentials);

    if (parsedCredentials.success) {
        const { email: rawEmail, password } = parsedCredentials.data;
        const email = rawEmail.toLowerCase().trim();

        console.log(`[Auth] Checking logic for: ${email}`);

        // Special case for Developer Mode - Checked BEFORE DB import
        if (email === 'dev@propflow.ai' && password === 'Sharktank101!') {
            console.log('[Auth] Developer Mode bypass triggered successfully');
            logger.auth('Developer Mode bypass triggered');
            return {
                id: 'dev-mode-user',
                email: 'dev@propflow.ai',
                name: 'Developer Mode',
                role: 'owner',
            };
        }

        console.log('[Auth] Not developer credentials, failing mock.');
        return null;
    } else {
        console.error('[Auth] Zod validation failed:', parsedCredentials.error);
        return null;
    }
}

async function runTest() {
    console.log('--- Testing Developer Credentials ---');
    const result = await authorize({
        email: 'dev@propflow.ai',
        password: 'Sharktank101!'
    });

    if (result && result.email === 'dev@propflow.ai') {
        console.log('✅ TEST PASSED: Developer mode logic works.');
    } else {
        console.error('❌ TEST FAILED: Developer mode logic returned:', result);
        process.exit(1);
    }
}

runTest();
