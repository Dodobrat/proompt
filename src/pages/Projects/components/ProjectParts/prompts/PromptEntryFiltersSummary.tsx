import { useGetAllFilterGroups } from "@/hooks/query";
import { PromptSchema } from "@/pages/Projects/schemas/promptSchema";

export function PromptEntryFiltersSummary({ data }: { data: PromptSchema }) {
  const { data: filterGroups } = useGetAllFilterGroups();

  if (!data.filters) return null;

  return (
    <div className="pt-2">
      {Object.entries(data.filters).map(([key, value], index) => {
        if (!value) return null;
        if (Array.isArray(value) && !value.length) return null;

        const groupTitle = filterGroups?.find((v) => v?.meta.filterName === key)
          ?.meta?.filterTitle;

        return (
          <div key={`prompt_${key}_${index}`}>
            <strong>{groupTitle}: </strong>
            {Array.isArray(value) && Boolean(value.length) && (
              <>
                {value.map((v, i) => {
                  const isLast = i === value.length - 1;
                  return (
                    <span
                      key={`prompt_${key}_${index}_${v}`}
                      className="text-muted-foreground"
                    >
                      {v}
                      {!isLast && " • "}
                    </span>
                  );
                })}
              </>
            )}
            {typeof value === "string" && Boolean(value) && (
              <span className="text-muted-foreground">{value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
