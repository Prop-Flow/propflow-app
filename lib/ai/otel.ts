import { register } from "@arizeai/phoenix-otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { OpenAIInstrumentation } from "@opentelemetry/instrumentation-openai";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

/**
 * Initializes OpenTelemetry tracing for AI operations and 
 * registers with Arize Phoenix for observability.
 */
export function initTracing() {
    if (typeof window !== 'undefined') return; // Only run on server-side

    // Initialize tracing provider
    const provider = new NodeTracerProvider();

    // Register instrumentations
    registerInstrumentations({
        instrumentations: [new OpenAIInstrumentation()],
    });

    provider.register();

    // Initialize Arize Phoenix for tracing visibility
    register({
        projectName: "propflow-agent",
    });

    console.log('📡 Tracing initialized (OpenTelemetry + Arize Phoenix)');
}
