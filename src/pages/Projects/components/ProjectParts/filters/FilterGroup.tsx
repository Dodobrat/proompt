import { Fragment } from "react";
import Highlighter from "react-highlight-words";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { FilterGroupData, FilterGroupFileData } from "@/api/filters";
import { FormInput } from "@/components/form";
import { Checkbox, RadioGroupItem } from "@/components/ui";
import { cn } from "@/lib/utils";

type FilterGroupProps = {
  group: FilterGroupFileData<FilterGroupData>;
  groupCount: number;
  search: string;
  isMultiSelect: boolean;
};

export function FilterGroup({
  group,
  groupCount,
  search,
  isMultiSelect,
}: FilterGroupProps) {
  const filterName = `filters.${group.meta.filterName}`;

  const { control, setValue } = useFormContext();
  const watchedFilterGroup = useWatch({
    control,
    name: filterName,
    defaultValue: isMultiSelect ? [] : "",
  });

  // console.log(watchedFilterGroup);

  const showTitle = groupCount > 1;

  const WrapperComponent = isMultiSelect ? Fragment : FormInput.RadioGroup;
  const WrapperComponentProps = isMultiSelect
    ? ({} as { name: string })
    : {
        name: filterName,
        className: "grid-cols-[repeat(auto-fit,minmax(min(100%,17.5rem),1fr))]",
        controllerRenderProps: (props: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => ({
          key: props.field.value ? undefined : "empty",
        }),
      };

  return (
    <div
      className={cn(
        "m-2 rounded",
        showTitle &&
          "grid grid-cols-[repeat(auto-fit,minmax(min(100%,17.5rem),1fr))] gap-x-6 border p-2",
      )}
    >
      {showTitle && (
        <p className="col-span-full pb-2 text-2xl font-medium">
          {group.meta.filterTitle}
        </p>
      )}
      <WrapperComponent {...WrapperComponentProps}>
        {group.data.map((option) => {
          const isSelected = !isMultiSelect
            ? watchedFilterGroup === option.name
            : watchedFilterGroup.includes(option.name);

          return (
            <label
              key={option.name}
              className={cn(
                "grid cursor-pointer grid-cols-[auto_1fr] gap-2 py-3 hover:bg-foreground/10",
                !showTitle && isSelected && "border-foreground",
                showTitle && isSelected && "bg-foreground/15",
                Boolean(option.imgSrc) && "pt-2",
                showTitle && "-mx-2 px-2",
                !showTitle && "rounded border px-2",
              )}
            >
              {!isMultiSelect && (
                <RadioGroupItem className="mt-0.5" value={option.name} />
              )}
              {isMultiSelect && (
                <Checkbox
                  className="mt-0.5"
                  checked={watchedFilterGroup.includes(option.name)}
                  onCheckedChange={(isChecked) => {
                    if (isChecked) {
                      return setValue(filterName, [
                        ...watchedFilterGroup,
                        option.name,
                      ]);
                    }
                    setValue(
                      filterName,
                      (watchedFilterGroup as string[]).filter(
                        (v) => v !== option.name,
                      ),
                    );
                  }}
                />
              )}
              <div>
                {Boolean(option.imgSrc) && (
                  <img
                    src={option.imgSrc}
                    alt={option.description || option.name}
                    loading="lazy"
                    className="mb-2 aspect-video w-full rounded object-cover"
                  />
                )}
                <Highlighter
                  autoEscape
                  className="block text-base font-medium leading-tight"
                  highlightClassName="bg-foreground/70 text-background rounded -mx-0.5 px-0.5"
                  searchWords={search.split(" ")}
                  textToHighlight={option.name}
                />
                {Boolean(option.description) && (
                  <Highlighter
                    autoEscape
                    className="block pt-1 text-sm leading-tight text-muted-foreground"
                    highlightClassName="bg-foreground/60 text-background rounded font-medium"
                    searchWords={search.split(" ")}
                    textToHighlight={option.description}
                  />
                )}
              </div>
            </label>
          );
        })}
      </WrapperComponent>
    </div>
  );
}
