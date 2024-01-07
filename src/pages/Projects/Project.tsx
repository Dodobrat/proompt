import { Fragment, useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Search, SendHorizonal, X } from "lucide-react";
import { z } from "zod";

import {
  FilterChoice,
  FilterGroupData,
  FilterGroupFileData,
} from "@/api/filters";
import { Container } from "@/components";
import { Form, FormInput } from "@/components/form";
import {
  Button,
  Checkbox,
  Input,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { GroupedFilter, useGetAllGroupedFilters } from "@/hooks/query";
import { cn } from "@/lib/utils";

import { Sidebar } from "./components";

const promptSchema = z.object({
  prompt: z.string().min(2).max(500),
  filters: z.any().optional(),
});

type PromptSchema = z.infer<typeof promptSchema>;

const defaultPromptValues: PromptSchema = {
  prompt: "",
  filters: {},
};

export function Project() {
  const onSubmit = (data: PromptSchema) => {
    console.log(data);
  };

  return (
    <Form<typeof promptSchema>
      schema={promptSchema}
      onSubmit={onSubmit}
      className="flex grow items-start gap-2"
      defaultValues={defaultPromptValues}
    >
      <Container className="self-end">
        <ChatForm />
      </Container>
      <Sidebar className="sm:border-l-px sm:border-l-border" as="aside">
        <FilterTabs />
      </Sidebar>
    </Form>
  );
}

function ChatForm() {
  return (
    <div className="grid min-h-full content-end gap-4">
      <AppliedFilters />
      <ChatPrompt />
    </div>
  );
}

function AppliedFilters() {
  const { control, setValue } = useFormContext();
  const watchedFilters = useWatch({ control, name: "filters" });

  return null;

  const filtersArr = Object.entries(watchedFilters);

  if (!filtersArr.length) return null;

  return filtersArr.map(([key, value]) => {
    if (typeof value === "string" && Boolean(value)) {
      const getNewFilterValue = () => {
        const copy = { ...watchedFilters };
        delete copy[key];
        return copy;
      };

      return (
        <div key={key}>
          <span>{key}:</span>
          <Button
            type="button"
            size="sm"
            onClick={() => setValue("filters", getNewFilterValue())}
          >
            {value}
            <X className="ml-2" />
          </Button>
        </div>
      );
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div key={key}>
          <span>{key}:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(value as object).map(([k, v]) => {
              if (!v?.length) return null;
              return (
                <div>
                  <span>{k}:</span>
                  {v.map((x: string) => {
                    return (
                      <Button
                        key={x}
                        type="button"
                        size="sm"
                        onClick={() => {
                          const newValue = v.filter((y: string) => y !== x);
                          setValue(`filters.${key}.${k}`, newValue);
                        }}
                      >
                        {x}
                        <X className="ml-2" />
                      </Button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return "Unhandled Filter - " + key;
  });
}

function ChatPrompt() {
  const { control } = useFormContext();
  const { isDirty } = useFormState({ control });

  return (
    <div className="sticky bottom-0 grid items-start gap-2 pb-4 sm:grid-cols-[1fr_auto]">
      <FormInput.Textarea
        name="prompt"
        label=""
        placeholder="Proompt here..."
        className="h-24 resize-none"
      />
      <div className="col-auto grid gap-2 py-1">
        <Button type="submit" size="icon" disabled={!isDirty}>
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
}

function FilterTabs() {
  const filterTabs = useGetAllGroupedFilters();

  const [selectedTab, setSelectedTab] = useState(filterTabs?.[0]?.name ?? "");

  const tabRefs = useRef<Record<string, HTMLButtonElement>>({});

  const addElToRef = (node: HTMLButtonElement) => {
    if (!node?.id) return;
    tabRefs.current = { ...tabRefs.current, [node?.id]: node };
  };

  useEffect(() => {
    if (!tabRefs.current[selectedTab]) return;
    tabRefs.current[selectedTab]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedTab, tabRefs]);

  if (!filterTabs?.length) return null;

  return (
    <Tabs defaultValue={filterTabs[0]?.name} onValueChange={setSelectedTab}>
      <TabsList className="flex h-auto w-full justify-start overflow-auto rounded-none">
        {filterTabs.map((tab) => (
          <TabsTrigger
            key={`filterTab_${tab.id}`}
            value={tab.name}
            id={tab.name}
            className="shrink-0 grow px-4 py-4"
            type="button"
            ref={addElToRef}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {filterTabs.map((tab) => (
        <TabsContent key={`filterTabContent_${tab.id}`} value={tab.name}>
          <FilterTabContent tab={tab} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FilterInput({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative px-2">
      <Search className="pointer-events-none absolute inset-y-0 left-4 h-full opacity-50" />
      <Input
        className="px-10"
        placeholder="Filter by name"
        value={value}
        onChange={({ target }) => onValueChange(target.value)}
        ref={searchRef}
      />
      {Boolean(value) && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => {
            onValueChange("");
            searchRef.current?.focus();
          }}
          className="absolute inset-y-0 right-2"
        >
          <X />
        </Button>
      )}
    </div>
  );
}

function NoResults() {
  return (
    <div className="grid gap-1 py-4 text-center">
      <div className="text-2xl font-bold">No Results</div>
      <div className="text-base text-muted-foreground">Try another search</div>
    </div>
  );
}

function NoData() {
  return (
    <div className="grid gap-1 py-4 text-center">
      <div className="text-2xl font-bold">No Data</div>
      <div className="text-base text-muted-foreground">No filters found</div>
    </div>
  );
}

function FilterTabContent({ tab }: { tab: GroupedFilter }) {
  const [search, setSearch] = useState("");

  const filteredGroups = tab.groups?.reduce(
    (acc: FilterGroupFileData<FilterGroupData>[], curr) => {
      if (!curr) return acc;

      const filteredData = curr.data.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description?.toLowerCase().includes(search.toLowerCase()),
      );

      if (!filteredData?.length) return acc;

      acc.push({ ...curr, data: filteredData });

      return acc;
    },
    [],
  );

  const hasNoData = !tab?.groups?.length;
  const hasNoResults = Boolean(search) && !filteredGroups.length;
  const groupCount = tab.groups?.length;
  const isMultiSelect = tab.choiceType === FilterChoice.Multiple;

  return (
    <>
      <FilterInput value={search} onValueChange={setSearch} />

      {hasNoData && <NoData />}
      {hasNoResults && <NoResults />}

      {filteredGroups?.map((group) => {
        if (!group) return "Unhandled Group";

        return (
          <FilterGroup
            key={`filterTabGroup_${tab.name}_${group?.meta.filterName}`}
            group={group}
            groupCount={groupCount}
            isMultiSelect={isMultiSelect}
            search={search}
          />
        );
      })}
    </>
  );
}

function FilterGroup({
  group,
  groupCount,
  search,
  isMultiSelect,
}: {
  group: FilterGroupFileData<FilterGroupData>;
  groupCount: number;
  search: string;
  isMultiSelect: boolean;
}) {
  const filterName = `filters.${group.meta.filterName}`;

  const { control, setValue } = useFormContext();
  const watchedFilterGroup = useWatch({
    control,
    name: filterName,
    defaultValue: isMultiSelect ? [] : "",
  });

  const showTitle = groupCount > 1;

  const WrapperComponent = isMultiSelect ? Fragment : FormInput.RadioGroup;
  const WrapperComponentProps = isMultiSelect
    ? ({} as { name: string })
    : {
        name: filterName,
        className: "grid-cols-[repeat(auto-fit,minmax(min(100%,17.5rem),1fr))]",
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
