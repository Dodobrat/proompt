import OpenAI from "openai";
import { useSessionStorage } from "usehooks-ts";
import { useMutation } from "@tanstack/react-query";

import { DB } from "@/lib/db";

export function useRefinePrompt(config: { onSuccess?: () => void }) {
  const [sessionApiKey] = useSessionStorage(DB.KEYS.SESSION_API_KEY, null);

  return useMutation({
    mutationFn: async (prompt: string) => {
      if (!sessionApiKey) {
        throw new Error("OpenAI key not found");
      }

      const openai = new OpenAI({
        apiKey: sessionApiKey,
        dangerouslyAllowBrowser: true,
        maxRetries: 1,
      });

      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a tool, which generates optimized prompts for Midjourney AI image generation given a set of parameters.",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-4",
      });

      const unsanitizedResponse = chatCompletion.choices?.[0]?.message?.content;

      if (!unsanitizedResponse) {
        throw new Error("No response from OpenAI");
      }

      const response = unsanitizedResponse.replace(/^"|"$/g, "");

      return response;
    },
    onSuccess: () => {
      config.onSuccess?.();
    },
  });
}
