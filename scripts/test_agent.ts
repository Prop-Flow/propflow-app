
import dotenv from 'dotenv';
import fs from 'fs';
import { generateAgentResponse, AgentContext } from '../lib/ai/agent-engine';

// Load environment variables
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function runTest() {
    console.log("🚀 Starting Agent Engine Test (Vertex AI Refactor)...");

    const context: AgentContext = {
        tenantId: "test-tenant-123",
        tenantName: "John Doe",
        propertyAddress: "123 Main St, Apt 4B",
        scenario: "lease_renewal",
        specificDetails: "Lease expires in 60 days. Current rent $1500. New offer $1550.",
        attemptNumber: 1
    };

    try {
        console.log("Generating response...");
        const response = await generateAgentResponse(context);
        console.log("\n✅ Response Received:\n");
        console.log(response);
    } catch (error) {
        console.error("\n❌ Error generating response:", error);
    }
}

runTest();
