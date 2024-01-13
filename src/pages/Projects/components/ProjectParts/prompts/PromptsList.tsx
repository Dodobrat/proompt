import { useParams } from "react-router-dom";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import {
  PromptSchema,
  SavedPrompt,
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

  const { setValue: setStoredProjectPrompts } = useLocalStorage<PromptSchema[]>(
    DB.KEYS.PROJECT_KEY_PROMPTS(params.id!),
    [],
  );

  const handleOnPinPrompt = (prompt: PromptSchema) => {
    const promptTimestampKey = new Date().getTime().toString();

    setStoredProjectPrompts((prev) => [
      ...prev,
      { ...prompt, id: promptTimestampKey },
    ]);

    setTemporaryPrompts((prev) => {
      const filteredPrompts = prev.filter(
        (p) => JSON.stringify(p) !== JSON.stringify(prompt),
      );
      return [...filteredPrompts, { ...prompt, id: promptTimestampKey }];
    });
  };

  const handleOnUnpinPrompt = (prompt: SavedPrompt) => {
    setStoredProjectPrompts((prev) =>
      prev.filter((p) => (p as SavedPrompt).id !== prompt.id),
    );

    setTemporaryPrompts((prev) => {
      return prev.map((p) => {
        if ((p as SavedPrompt).id === prompt.id) {
          const unpinnedPrompt = structuredClone(p);
          delete (unpinnedPrompt as Partial<SavedPrompt>).id;
          return unpinnedPrompt;
        }
        return p;
      });
    });
  };

  return (
    <>
      {temporaryPrompts.map((prompt, index) => (
        <PromptEntry
          key={JSON.stringify(prompt) + index}
          data={prompt}
          onPinPrompt={handleOnPinPrompt}
          onUnpinPrompt={handleOnUnpinPrompt}
          //   onRefinePrompt={console.log}
        />
      ))}
    </>
  );
}
