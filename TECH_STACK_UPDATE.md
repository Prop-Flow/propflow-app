# Propflow Tech Stack Update: AI Agents & MCP Integration
Date: January 7, 2026 Version: 1.0.0

## Overview
This document outlines the recent upgrades to the Propflow technology stack. We have significantly enhanced the core AI Engine (`lib/ai/agent-engine.ts`) by integrating Model Context Protocol (MCP) capabilities. These changes transform the AI from a simple text generator into a sophisticated agent capable of reasoning, memory retention, database access, and observability.

## 1. New Dependencies & Tech Stack Additions
We have introduced the following packages to support advanced observability and agent tooling:

| Package | Purpose |
|---------|---------|
| `@arizeai/phoenix-otel` | provides OpenTelemetry instrumentation to trace and debug AI execution flows and tool usage. |
| `@opentelemetry/sdk-trace-node` | Core SDK for Node.js tracing. |
| `@opentelemetry/instrumentation-openai` | Automatically captures inputs, outputs, and latency for all OpenAI API calls. |
| `zod` | Used for strict schema validation of tool inputs (Thinking, Memory, Database tools). |

## 2. Integrated MCP Capabilities (Tools)
The AI agents now have access to a suite of "polyfilled" MCP tools that run locally within the application.

### 🧠 Sequential Thinking (Reasoning)
- **Feature**: Allows the agent to pause, "think" step-by-step, revise its logic, and branch its reasoning before answering.
- **Benefit**: Vastly improved handling of complex scenarios (e.g., "Analyze the risks of this lease vs. the tenant's payment history").
- **Location**: `lib/ai/tools/sequential-thinking.ts`

### 💾 Long-Term Memory
- **Feature**: A persistence layer that lets agents store and recall information across conversations.
- **Benefit**: The agent can "remember" tenant preferences (e.g., "Mrs. Smith prefers texts over email") or property quirks.
- **Storage**: `.agent/memory_store.json` (Local JSON file).
- **Location**: `lib/ai/tools/memory.ts`

### 🔍 Database Access (Prisma Integration)
- **Feature**: Direct read-access to the application's database tables (User, Lease, Property, etc.).
- **Benefit**: Agents can answer factual questions like "What is the current balance for Unit 4B?" without guessing.
- **Location**: `lib/ai/tools/database.ts`

### 🐞 Observability (Arize Phoenix)
- **Feature**: Full tracing of every AI interaction.
- **Benefit**: You can now see exactly why an agent made a decision, how long each step took, and what tool inputs were used.
- **Configuration**: Auto-instruments on app startup in `agent-engine.ts`.

### 🛠️ GitHub Integration
- **Feature**: Ability to log bugs or feature requests directly from the agent.
- **Benefit**: Streamlines development by allowing the AI to flag issues it encounters.
- **Location**: `lib/ai/tools/github.ts`

## 3. Configuration Requirements
To fully utilize these new features, ensure your environment (`.env.local`) has the following keys:

```bash
# Required for Intelligence
OPENAI_API_KEY=sk-...

# Required for Database Tool (Already configured in Propflow)
DATABASE_URL=postgresql://...

# Optional: For Real-world GitHub Issues (Default: Simulates locally)
GITHUB_TOKEN=ghp_...
GITHUB_REPO=owner/repo
```

## 4. How to Verify
1. **Thinking**: Ask the agent a complex question. You will see it generate "thought" tokens before the final answer.
2. **Memory**: Tell the agent "My favorite color is blue." Later, ask "What is my favorite color?"
3. **Tracing**: Run the app and check your console or Arize dashboard (if configured) to see traces of the execution.
