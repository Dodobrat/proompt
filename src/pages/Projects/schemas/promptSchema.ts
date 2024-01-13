import { z } from "zod";

export const promptSchema = z.object({
  prompt: z.string().max(500).min(1, "Prompt cannot be empty"),
  filters: z.any().optional(),
});

export type PromptSchema = z.infer<typeof promptSchema>;
export type SavedPrompt = PromptSchema & { id: string };
