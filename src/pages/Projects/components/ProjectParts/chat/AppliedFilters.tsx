import { useFormContext, useWatch } from "react-hook-form";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui";

import { AppliedFiltersContent } from "./AppliedFiltersContent";

function checkAllFiltersEmpty(watchedFilters: object) {
  if (typeof watchedFilters !== "object") return false;

  const allFiltersEmpty = Object.values(watchedFilters).every((v) => {
    if (!v) return true;
    if (Array.isArray(v) && !v.length) return true;
    return false;
  });

  return allFiltersEmpty;
}

function getAppliedFiltersCount(watchedFilters: object) {
  if (typeof watchedFilters !== "object") return 0;

  const count = Object.values(watchedFilters).reduce((acc: number, curr) => {
    if (!curr) return acc;
    if (Array.isArray(curr)) return acc + curr.length;
    return acc + 1;
  }, 0);

  return count;
}

export function AppliedFilters() {
  const { control } = useFormContext();
  const watchedFilters = useWatch({ control, name: "filters" });

  const appliedFiltersCount = getAppliedFiltersCount(watchedFilters);
  const allFiltersEmpty = checkAllFiltersEmpty(watchedFilters);

  if (allFiltersEmpty) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="applied_filters"
        className="overflow-hidden rounded border"
      >
        <AccordionTrigger className="p-2 text-xl focus-visible:outline-transparent [&[data-state=open]]:border-b">
          Applied Filters ({appliedFiltersCount})
        </AccordionTrigger>
        <AccordionContent className="max-h-[50vh] min-h-20 space-y-4 overflow-auto p-2">
          <AppliedFiltersContent />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
