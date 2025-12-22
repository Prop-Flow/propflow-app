export interface Signer {
    email: string;
    name: string;
    role?: string;
}

export interface SignatureRequestResult {
    envelopeId: string;
    status: 'sent' | 'failed' | 'created';
    provider: string;
    signingUrl?: string; // For embedded signing or dev testing
}

export interface ISignatureProvider {
    sendDocument(fileUrl: string, signers: Signer[], documentName: string): Promise<SignatureRequestResult>;
}

export class MockSignatureProvider implements ISignatureProvider {
    async sendDocument(fileUrl: string, signers: Signer[], documentName: string): Promise<SignatureRequestResult> {
        console.log(`[MockSignature] Sending document "${documentName}" (${fileUrl}) to signers:`, signers);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            envelopeId: `mock_env_${Date.now()}`,
            status: 'sent',
            provider: 'mock',
            signingUrl: `http://localhost:3000/mock-signing?doc=${encodeURIComponent(documentName)}` // Simulated link
        };
    }
}

// Placeholder for future implementations
export class SignatureApiProvider implements ISignatureProvider {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async sendDocument(fileUrl: string, signers: Signer[], documentName: string): Promise<SignatureRequestResult> {
        // Implementation for SignatureAPI.com would go here
        throw new Error("SignatureAPI provider not yet configured");
    }
}

const isDev = process.env.NODE_ENV === 'development';

// Factory to get the active provider
export function getSignatureService(): ISignatureProvider {
    if (isDev || process.env.SIGNATURE_PROVIDER === 'mock') {
        return new MockSignatureProvider();
    }
    // Default to Mock for now, or check env vars for other providers
    return new MockSignatureProvider();
}
