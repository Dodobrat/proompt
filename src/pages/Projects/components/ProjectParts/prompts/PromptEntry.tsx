import { useEffect, useRef } from "react";
import { Clipboard, Pin, PinOff, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard, useSessionStorage } from "usehooks-ts";

import { Button } from "@/components/ui";
import { DB } from "@/lib/db";
import {
  PromptSchema,
  PromptType,
} from "@/pages/Projects/schemas/promptSchema";

import { PromptEntryFiltersSummary } from "./PromptEntryFiltersSummary";

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false, // Use 24-hour format
};

const dateFormatter = new Intl.DateTimeFormat(undefined, dateFormatOptions);

type PromptEntryProps = {
  data: PromptSchema;
  onPinPrompt: (prompt: PromptSchema) => void;
  onUnpinPrompt: (prompt: PromptSchema) => void;
  onRefinePrompt: (prompt: string) => void;
  entryRef?: React.Ref<HTMLElement>;
};

const convertPromptToText = (el: HTMLDivElement | null) => {
  if (!el) return;

  const range = document.createRange();
  range.selectNodeContents(el);

  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);

  const selectedText = selection.toString();

  selection.removeAllRanges();

  return selectedText;
};

export function PromptEntry({
  data,
  onPinPrompt,
  onUnpinPrompt,
  onRefinePrompt,
  entryRef,
}: PromptEntryProps) {
  const promptContentRef = useRef<HTMLDivElement>(null);

  const [sessionApiKey] = useSessionStorage(DB.KEYS.SESSION_API_KEY, null);
  const hasSessionApiKey = Boolean(sessionApiKey);

  const isRefinedPrompt = data.type === PromptType.AI;
  const isPinnedRefinedPrompt = data.type === PromptType.AIPinned;
  const isPinnedPrompt = data.type === PromptType.Pinned;
  const isTemporaryPrompt = data.type === PromptType.Temporary;

  const isPinned = isPinnedPrompt || isPinnedRefinedPrompt;
  const isAIPrompt = isRefinedPrompt || isPinnedRefinedPrompt;
  const showRefinePromptButton = !isAIPrompt && hasSessionApiKey;

  const hasAppliedFilters =
    typeof data.filters === "object" &&
    Object.values(data.filters).some((v) => (Array.isArray(v) ? v.length : v));

  const [copiedValue, copyFn] = useCopyToClipboard();

  useEffect(() => {
    if (!copiedValue) return;
    toast.success("Copied to clipboard");
  }, [copiedValue, copyFn]);

  const handleOnRefinePrompt = () => {
    const selectedText = convertPromptToText(promptContentRef.current);
    if (!selectedText) return toast.error("Couldn't get prompt data");
    onRefinePrompt?.(selectedText);
  };

  const handleOnCopy = () => {
    const selectedText = convertPromptToText(promptContentRef.current);
    if (!selectedText) return toast.error("Couldn't copy to clipboard");
    copyFn(selectedText);
  };

  const handleOnPinUnpinPrompt = () => {
    if (isPinned) return onUnpinPrompt?.(data);
    return onPinPrompt?.(data);
  };

  return (
    <article
      className="relative rounded border p-2"
      id={data.id}
      ref={entryRef}
    >
      {isAIPrompt && (
        <span className="absolute -top-2.5 left-2 rounded-full bg-foreground px-2 py-0.5 leading-none text-background ">
          AI
        </span>
      )}
      <div className="flex flex-wrap items-start gap-2 pb-2">
        <p className="w-full grow text-xl font-medium sm:w-auto">
          {isTemporaryPrompt && "Temporary Prompt"}
          {isPinnedPrompt && "Pinned Prompt"}
          {isRefinedPrompt && "AI Refined Prompt"}
          {isPinnedRefinedPrompt && "Pinned AI Refined Prompt"}

          {Boolean(data.timestamp) && typeof data.timestamp === "number" && (
            <span className="block text-sm text-muted-foreground">
              {dateFormatter.format(new Date(data.timestamp))}
            </span>
          )}
        </p>
        {showRefinePromptButton && (
          <Button
            className="shrink-0"
            variant="outline"
            type="button"
            onClick={handleOnRefinePrompt}
          >
            <Wand2 className="mr-2" />
            Refine with AI
          </Button>
        )}
        <Button
          className="shrink-0"
          variant="secondary"
          size="icon"
          type="button"
          title="Copy to clipboard"
          onClick={handleOnCopy}
        >
          <Clipboard />
        </Button>
        <Button
          className="shrink-0"
          variant="secondary"
          size="icon"
          type="button"
          title="Pin prompt"
          onClick={handleOnPinUnpinPrompt}
        >
          {isPinned ? <PinOff /> : <Pin />}
        </Button>
      </div>
      <div ref={promptContentRef}>
        {isAIPrompt && <p>{data.refinements}</p>}
        {!isAIPrompt && <p>{data.prompt}</p>}
        {!isAIPrompt && hasAppliedFilters && (
          <PromptEntryFiltersSummary data={data} />
        )}
      </div>
    </article>
  );
}
