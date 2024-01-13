import { useEffect, useRef } from "react";
import { Clipboard, Pin, PinOff, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { Button } from "@/components/ui";
import {
  PromptSchema,
  SavedPrompt,
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
  onPinPrompt?: (prompt: PromptSchema) => void;
  onUnpinPrompt?: (prompt: SavedPrompt) => void;
  onRefinePrompt?: (prompt: string) => void;
};

export function PromptEntry({
  data,
  onPinPrompt,
  onUnpinPrompt,
  onRefinePrompt,
}: PromptEntryProps) {
  const [copiedValue, copyFn] = useCopyToClipboard();

  useEffect(() => {
    if (!copiedValue) return;
    toast.success("Copied to clipboard");
    setTimeout(() => copyFn(""), 5000);
  }, [copiedValue, copyFn]);
  const promptContentRef = useRef<HTMLDivElement>(null);

  const hasAppliedFilters = Object.values(data.filters).some((v) =>
    Array.isArray(v) ? v.length : v,
  );

  const isSavedPrompt = Boolean((data as SavedPrompt)?.id);

  const promptTitle = isSavedPrompt
    ? dateFormatter.format(new Date(Number((data as SavedPrompt).id)))
    : "Temporary Prompt";

  const convertPromptToText = () => {
    const textDiv = promptContentRef.current;

    if (!textDiv) return;

    const range = document.createRange();
    range.selectNodeContents(textDiv);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const selectedText = selection.toString();

    selection.removeAllRanges();

    return selectedText;
  };

  return (
    <article className="rounded border p-2">
      <div className="flex flex-wrap items-start gap-2 pb-2">
        <p className="w-full grow text-xl font-medium sm:w-auto">
          {promptTitle}
        </p>
        {Boolean(onRefinePrompt) && (
          <Button
            className="shrink-0"
            variant="outline"
            type="button"
            onClick={() => {
              const selectedText = convertPromptToText();
              if (!selectedText) {
                toast.error("Couldn't get prompt data");
                return;
              }
              onRefinePrompt?.(selectedText);
            }}
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
          onClick={() => {
            const selectedText = convertPromptToText();
            if (!selectedText) {
              toast.error("Couldn't copy to clipboard");
              return;
            }
            copyFn(selectedText);
          }}
        >
          <Clipboard />
        </Button>
        {Boolean(onPinPrompt) && Boolean(onUnpinPrompt) && (
          <Button
            className="shrink-0"
            variant="secondary"
            size="icon"
            type="button"
            title="Pin prompt"
            onClick={() =>
              isSavedPrompt
                ? onUnpinPrompt?.(data as SavedPrompt)
                : onPinPrompt?.(data)
            }
          >
            {isSavedPrompt ? <PinOff /> : <Pin />}
          </Button>
        )}
      </div>
      <div ref={promptContentRef}>
        <p>{data.prompt}</p>
        {hasAppliedFilters && <PromptEntryFiltersSummary data={data} />}
      </div>
    </article>
  );
}
