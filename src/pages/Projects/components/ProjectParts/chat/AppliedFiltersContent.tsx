import { useFormContext, useWatch } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui";
import { useGetAllFilterGroups } from "@/hooks/query";

export function AppliedFiltersContent() {
  const { data } = useGetAllFilterGroups();

  const { control, setValue } = useFormContext();
  const watchedFilters = useWatch({ control, name: "filters" });

  if (typeof watchedFilters !== "object") return null;

  return Object.entries(watchedFilters).map(([key, value]) => {
    if (!value) return null;
    if (Array.isArray(value) && !value.length) return null;

    const groupTitle =
      data?.find((v) => v?.meta.filterName === key)?.meta?.filterTitle || "";

    return (
      <div key={`appliedFilter_${key}`} className="">
        <p className="pb-1 text-base font-medium">{groupTitle}</p>
        {typeof value === "string" && (
          <Button
            type="button"
            size="sm"
            onClick={() => setValue(`filters.${key}`, "")}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            {value}
            <X className="ml-2" />
          </Button>
        )}
        {Array.isArray(value) && (
          <div className="inline-flex flex-wrap gap-2">
            {value.map((v) => (
              <Button
                key={`appliedFilter_${key}_${v}`}
                type="button"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground"
                onClick={() =>
                  setValue(
                    `filters.${key}`,
                    (value as string[]).filter((val) => val !== v),
                  )
                }
              >
                {v}
                <X className="ml-2" />
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  });
}
