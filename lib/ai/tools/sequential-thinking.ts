
import { z } from "zod";

export const sequentialThinkingSchema = z.object({
    thought: z.string().describe("Your current thinking step"),
    thoughtNumber: z.number().int().describe("The sequential number of this thought"),
    totalThoughts: z.number().int().describe("Estimated total thoughts needed"),
    nextThoughtNeeded: z.boolean().describe("Whether another thought step is needed"),
    isRevision: z.boolean().optional().describe("If this revises a previous thought"),
    revisesThought: z.number().int().optional().describe("Which thought number is being revised"),
    branchFromThought: z.number().int().optional().describe("If branching, which thought number to branch from"),
    branchId: z.string().optional().describe("Identifier for the current thought branch"),
});

export type SequentialThinkingInput = z.infer<typeof sequentialThinkingSchema>;

export const SEQUENTIAL_THINKING_TOOL_DEF = {
    name: "sequential_thinking",
    description: `A tool for performing a structured, step-by-step thinking process. 
    Use this tool *multiple times* to break down complex problems, plan solutions, and reason deeply. 
    Unlike a single 'chain of thought' block, this allows you to output distinct thought steps, revise them, and branch your reasoning. 
    ALWAYS use this for complex tasks before generating the final response.
    When you are done thinking, call this with nextThoughtNeeded: false, and then output your final response in the next turn.`,
    parameters: {
        type: "object",
        properties: {
            thought: { type: "string", description: "Your current thinking step" },
            thoughtNumber: { type: "integer", description: "The sequential number of this thought" },
            totalThoughts: { type: "integer", description: "Estimated total thoughts needed" },
            nextThoughtNeeded: { type: "boolean", description: "Whether another thought step is needed" },
            isRevision: { type: "boolean", description: "If this revises a previous thought" },
            revisesThought: { type: "integer", description: "Which thought number is being revised" },
            branchFromThought: { type: "integer", description: "If branching, which thought number to branch from" },
            branchId: { type: "string", description: "Identifier for the current thought branch" }
        },
        required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
    }
};

/**
 * Validates and parses the tool arguments
 */
export function validateSequentialThinking(args: unknown): SequentialThinkingInput {
    return sequentialThinkingSchema.parse(args);
}
