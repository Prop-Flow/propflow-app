# Propflow Tech Stack Update: Google Vertex AI & Firebase Integration
Date: January 7, 2026 Version: 1.1.0

## Overview
This document outlines the migration of Propflow's AI backend from OpenAI to Google Vertex AI. We have transitioned to Gemini 1.5 (Pro/Flash) for advanced multimodal document analysis and agent reasoning, integrated Firebase Admin SDK for unified GCP management, and updated our vector embedding model to `text-embedding-004`.

## 1. New Dependencies & Tech Stack Additions
We have replaced OpenAI with Google Cloud's unified AI platform:

| Package | Purpose |
|---------|---------|
| `@google-cloud/vertexai` | Primary SDK for Gemini 1.5 Pro/Flash and text embeddings. |
| `firebase-admin` | Server-side management of Firebase services and GCP resources. |
| `@arizeai/phoenix-otel` | OpenTelemetry instrumentation for AI observability. |
| `@opentelemetry/instrumentation-http` | Captures Vertex AI API calls and other external service latency. |
| `zod` | Strict schema validation for tool inputs (Thinking, Memory, Database). |

## 2. Integrated Gemini Capabilities
The AI agents are now powered by Google's Gemini models, offering native multimodal support.

### 🧠 Gemini 1.5 Pro / Flash (Agents & Parser)
- **Feature**: Native support for processing PDFs, images, and long-context reasoning without pre-extraction.
- **Benefit**: Faster, more accurate document parsing and superior "step-by-step" logical thinking.
- **Location**: `lib/ai/vertex.ts` (Unified service wrapper).

### 📐 Text Embeddings (Vertex-based)
- **Feature**: Switched from OpenAI to `text-embedding-004` (768 dimensions).
- **Benefit**: Improved semantic retrieval for tenant-specific context within the Google ecosystem.
- **Location**: `lib/ai/vector-store.ts`.

### 💾 Firebase Admin SDK
- **Feature**: Integrated for robust server-side authentication and backend service orchestration.
- **Cloud Connection**: Local development uses Application Default Credentials (ADC).

### 🔍 Database & Memory
- **Persistence**: Using Google Cloud Firestore as the primary database for property data, tenant information, and application state.
- **Provider**: Standard Google Cloud project `propflow-ai-483621`.

### 🐞 Observability (Arize Phoenix)
- **Tracing**: Full HTTP-level tracing of Every Gemini call, replacing the previous OpenAI-specific instrumentation.

## 3. Configuration Requirements
Updated environment keys (`.env.local`):

```bash
# Required for GCP/Vertex
NEXT_PUBLIC_GCP_PROJECT_ID=propflow-...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Required for Vector Store (Pinecone)
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
```

> [!IMPORTANT]
> Since we changed embedding models, existing vectors in Pinecone (1536d) are incompatible with the new 768d vectors. The index must be recreated or cleared.

## 4. How to Verify
1. **Gemini Reasoning**: Ask the agent a complex property management question. 
2. **Document Parsing**: Upload a lease PDF; the agent will process it using native multimodal vision.
3. **Embeddings**: Run `ts-node scripts/test-vertex-integration.ts` to verify API connectivity.
