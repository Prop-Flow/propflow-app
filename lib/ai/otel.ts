import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

/**
 * Initialize OpenTelemetry tracing with Arize Phoenix
 */
export function initTracing() {
    // Export to Arize Phoenix (local or hosted)
    const exporter = new OTLPTraceExporter({
        url: process.env.PHOENIX_COLLECTOR_URL || "http://localhost:6006/v1/traces",
    });

    const provider = new NodeTracerProvider({
        resource: resourceFromAttributes({
            [SemanticResourceAttributes.SERVICE_NAME]: "propflow-ai-agent",
        }),
        spanProcessors: [new BatchSpanProcessor(exporter)],
    });

    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(), // Broadly capture Vertex AI and other API calls
        ],
    });

    console.log("OTel Tracing initialized (Vertex AI / HTTP)");
}
