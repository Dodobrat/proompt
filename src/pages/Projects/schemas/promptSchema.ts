import { z } from "zod";

export enum PromptType {
  Temporary = "temporary",
  Pinned = "pinned",
  AI = "ai",
  AIPinned = "ai-pinned",
}

export const promptSchema = z.object({
  id: z.string().optional(),
  prompt: z
    .string()
    .max(500, "Maximum 500 characters allowed")
    .min(1, "Field is required"),
  filters: z.any().optional(),
  refinements: z.string().optional(),
  timestamp: z.number().optional(),
  type: z
    .enum([
      PromptType.Temporary,
      PromptType.Pinned,
      PromptType.AI,
      PromptType.AIPinned,
    ])
    .optional(),
});

export type PromptSchema = z.infer<typeof promptSchema>;
