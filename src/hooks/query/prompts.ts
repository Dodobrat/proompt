import OpenAI from "openai";
import { useSessionStorage } from "usehooks-ts";
import { useMutation } from "@tanstack/react-query";

import { DB } from "@/lib/db";

export function useRefinePrompt() {
  const [sessionApiKey] = useSessionStorage(DB.KEYS.SESSION_API_KEY, null);

  return useMutation({
    mutationFn: (prompt: string) => {
      if (!sessionApiKey) {
        throw new Error("OpenAI key not found");
      }

      const openai = new OpenAI({
        apiKey: sessionApiKey,
        dangerouslyAllowBrowser: true,
      });

      return openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a tool, which generates optimized prompts for Midjourney AI image generation given a set of parameters.",
          },
          { role: "user", content: prompt },
        ],
      });
    },
  });
}
