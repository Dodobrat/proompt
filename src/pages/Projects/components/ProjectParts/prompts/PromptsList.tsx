import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateEffect } from "usehooks-ts";

import { useLocalStorage } from "@/hooks";
import { useRefinePrompt } from "@/hooks/query";
import { DB } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  PromptSchema,
  PromptType,
} from "@/pages/Projects/schemas/promptSchema";

import { PromptEntry } from "./PromptEntry";

type PromptsListProps = {
  temporaryPrompts: PromptSchema[];
  setTemporaryPrompts: React.Dispatch<React.SetStateAction<PromptSchema[]>>;
};

export function PromptsList({
  temporaryPrompts,
  setTemporaryPrompts,
}: PromptsListProps) {
  const params = useParams();

  const pendingRefinementRef = useRef<HTMLDivElement>(null);
  const lastRefinedPromptIdRef = useRef<string | null>(null);
  const promptsRef = useRef<Record<string, HTMLElement>>({});

  const { mutateAsync: refinePromptAsync, isPending } = useRefinePrompt({
    onSuccess: () => {
      toast.success("Prompt refined successfully!");
    },
  });

  useUpdateEffect(() => {
    if (!lastRefinedPromptIdRef.current) return;

    const promptRef = promptsRef.current[lastRefinedPromptIdRef.current];
    if (!promptRef) return;

    promptRef.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [temporaryPrompts]);

  useEffect(() => {
    if (isPending && pendingRefinementRef.current) {
      pendingRefinementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isPending]);

  useEffect(() => {
    // Using setTimeout to ensure the prompts are rendered before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [params]);

  const { setValue: setStoredProjectPrompts } = useLocalStorage<PromptSchema[]>(
    DB.KEYS.PROJECT_KEY_PROMPTS(params.id!),
    [],
  );

  const handleOnPinPrompt = (prompt: PromptSchema) => {
    const promptTimestampKey = new Date().getTime();

    const pinnedPrompt = {
      ...structuredClone(prompt),
      type:
        prompt.type === PromptType.AI ? PromptType.AIPinned : PromptType.Pinned,
      id: promptTimestampKey.toString(),
      timestamp: promptTimestampKey,
    };

    setStoredProjectPrompts((prev) => [...prev, pinnedPrompt]);

    setTemporaryPrompts((prev) => {
      const filteredPrompts = prev.filter(
        (p) => JSON.stringify(p) !== JSON.stringify(prompt),
      );
      return [...filteredPrompts, pinnedPrompt];
    });
  };

  const handleOnUnpinPrompt = (prompt: PromptSchema) => {
    setStoredProjectPrompts((prev) => prev.filter((p) => p.id !== prompt.id));

    setTemporaryPrompts((prev) => {
      return prev.map((p) => {
        if (p.id === prompt.id) {
          const unpinnedPrompt = {
            ...structuredClone(prompt),
            type:
              prompt.type === PromptType.AIPinned
                ? PromptType.AI
                : PromptType.Temporary,
          };

          return unpinnedPrompt;
        }
        return p;
      });
    });
  };

  const handleOnRefinePrompt = async (prompt: string) => {
    const refinedPrompt = await refinePromptAsync(prompt);

    const promptTimestamp = new Date().getTime();

    const refinedPromptEntry: PromptSchema = {
      prompt: "",
      id: promptTimestamp.toString(),
      timestamp: promptTimestamp,
      refinements: refinedPrompt,
      type: PromptType.AI,
    };

    lastRefinedPromptIdRef.current = refinedPromptEntry.id!;

    setTemporaryPrompts((prev) => [...prev, refinedPromptEntry]);
  };

  return (
    <>
      {temporaryPrompts.map((prompt, index) => (
        <PromptEntry
          key={JSON.stringify(prompt) + index}
          data={prompt}
          onPinPrompt={handleOnPinPrompt}
          onUnpinPrompt={handleOnUnpinPrompt}
          onRefinePrompt={handleOnRefinePrompt}
          entryRef={(el) => {
            if (!el) return;
            promptsRef.current = {
              ...promptsRef.current,
              [el.id]: el,
            };
          }}
        />
      ))}
      <div
        className={cn(
          "animate-pulse items-center gap-2 rounded border p-2",
          isPending ? "flex" : "hidden",
        )}
        ref={pendingRefinementRef}
      >
        <Loader2 className="animate-spin" />
        Refining prompt...
      </div>
    </>
  );
}
