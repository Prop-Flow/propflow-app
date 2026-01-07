
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';

// Memory storage schema
const memoryEntrySchema = z.object({
    id: z.string(),
    content: z.string(),
    type: z.enum(['fact', 'preference', 'interaction', 'plan']),
    timestamp: z.string(),
    tags: z.array(z.string()).optional()
});

type MemoryEntry = z.infer<typeof memoryEntrySchema>;

const MEMORY_FILE_PATH = path.join(process.cwd(), '.agent', 'memory_store.json');

// Ensure memory file exists
async function ensureMemoryFile() {
    try {
        await fs.access(MEMORY_FILE_PATH);
    } catch {
        await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify([]));
    }
}

export const MEMORY_TOOL_DEF = {
    name: "memory_tool",
    description: `A tool for managing long-term memory. Use this to store and retrieve important information about the tenant, property, or past interactions.
    Actions:
    - 'store': Save a new memory (requires content, type)
    - 'retrieve': Find memories (optional query or tag)
    - 'list': Show all memories
    `,
    parameters: {
        type: "object",
        properties: {
            action: { type: "string", enum: ["store", "retrieve", "list"] },
            content: { type: "string", description: "Content to store or query to search" },
            type: { type: "string", enum: ["fact", "preference", "interaction", "plan"], description: "Type of memory for classification" },
            tags: { type: "array", items: { type: "string" }, description: "Tags for categorization" }
        },
        required: ["action"]
    }
};

/**
 * Handle memory operations
 */
export async function handleMemoryTool(args: any): Promise<string> {
    await ensureMemoryFile();
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    const memories: MemoryEntry[] = JSON.parse(data);

    if (args.action === 'store') {
        const newMemory: MemoryEntry = {
            id: Date.now().toString(),
            content: args.content,
            type: args.type || 'fact',
            timestamp: new Date().toISOString(),
            tags: args.tags || []
        };
        memories.push(newMemory);
        await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(memories, null, 2));
        return `Memory stored with ID: ${newMemory.id}`;
    }

    if (args.action === 'retrieve') {
        // Simple keyword match for now
        const query = args.content.toLowerCase();
        const found = memories.filter(m =>
            m.content.toLowerCase().includes(query) ||
            m.tags?.some(t => t.toLowerCase().includes(query))
        );
        return JSON.stringify(found, null, 2);
    }

    if (args.action === 'list') {
        return JSON.stringify(memories.slice(-10), null, 2); // Last 10
    }

    return "Invalid action";
}
