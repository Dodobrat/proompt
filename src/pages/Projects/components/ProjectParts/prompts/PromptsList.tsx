import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useLocalStorage } from "@/hooks";
import { useRefinePrompt } from "@/hooks/query";
import { DB } from "@/lib/db";
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

  const { mutateAsync: refinePromptAsync, isPending } = useRefinePrompt();

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
        />
      ))}
      {isPending && (
        <div className="flex animate-pulse items-center gap-2 rounded border p-2">
          <Loader2 className="animate-spin" />
          Refining prompt...
        </div>
      )}
    </>
  );
}
