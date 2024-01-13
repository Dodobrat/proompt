import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { useLocation, useParams } from "react-router-dom";
import {
  Clipboard,
  Edit2,
  Filter,
  MessageCircleQuestion,
  Pin,
  PinOff,
  Search,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCopyToClipboard,
  useMediaQuery,
  useUpdateEffect,
} from "usehooks-ts";
import { z } from "zod";

import {
  FilterChoice,
  FilterGroupData,
  FilterGroupFileData,
} from "@/api/filters";
import { Container, Portal } from "@/components";
import { Form, FormInput } from "@/components/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Input,
  RadioGroupItem,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useLocalStorage } from "@/hooks";
import {
  GroupedFilter,
  useGetAllFilterGroups,
  useGetAllGroupedFilters,
} from "@/hooks/query";
import { DB } from "@/lib/db";
import { cn, getCssVar } from "@/lib/utils";

import { ResizeDirection, Sidebar } from "./components";

const FILTERS_SIDEBAR_RESIZE_CONFIG = {
  minWidth: 300,
  maxWidth: 700,
  direction: ResizeDirection.RightToLeft,
  storageKey: DB.KEYS.FILTERS_SIDEBAR_WIDTH,
};

const MOBILE_FILTERS_SIDEBAR_PORTAL_ID = "mobile-filters-sidebar-portal";

const promptSchema = z.object({
  prompt: z.string().max(500).min(1, "Prompt cannot be empty"),
  filters: z.any().optional(),
});

type PromptSchema = z.infer<typeof promptSchema>;
type SavedPrompt = PromptSchema & { id: string };

const defaultPromptValues: PromptSchema = {
  prompt: "",
  filters: {},
};

export function Project() {
  const params = useParams();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    setValue: setStoredProjectFilters,
    getValue: getLatestStoredProjectFilters,
  } = useLocalStorage(
    DB.KEYS.PROJECT_KEY_FILTERS(params.id!),
    defaultPromptValues,
  );

  const {
    getValue: getLatestStoredProjectPrompts,
    setValue: setStoredProjectPrompts,
  } = useLocalStorage<PromptSchema[]>(
    DB.KEYS.PROJECT_KEY_PROMPTS(params.id!),
    [],
  );

  const [temporaryPrompts, setTemporaryPrompts] = useState(() =>
    getLatestStoredProjectPrompts(),
  );

  useUpdateEffect(() => {
    setTemporaryPrompts(getLatestStoredProjectPrompts());
  }, [params.id]);

  const onSubmit = (data: PromptSchema) => {
    setStoredProjectFilters(data);
    setTemporaryPrompts((prev) => [...prev, structuredClone(data)]);
    // SEND DATA TO API
  };

  const handleOnEnterPress = () => {
    if (!formRef.current) return;
    // SUBMIT FORM ON ENTER PRESS (SHIFT + ENTER TO ADD NEW LINE)
    formRef.current.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  };

  const handleOnSavePrompt = (prompt: PromptSchema) => {
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

  const defaultValues = useMemo(() => {
    const storedData = getLatestStoredProjectFilters();
    if (!storedData) return defaultPromptValues;
    return storedData;
  }, [getLatestStoredProjectFilters]);

  return (
    <Form<typeof promptSchema>
      schema={promptSchema}
      onSubmit={onSubmit}
      className="flex grow items-end gap-2 xl:items-start"
      defaultValues={defaultValues}
      formRef={formRef}
      key={params.id}
    >
      <Container className="self-end">
        <ChatForm onEnterPress={handleOnEnterPress}>
          {temporaryPrompts.map((prompt, index) => (
            <PromptEntry
              key={JSON.stringify(prompt) + index}
              data={prompt}
              onSavePrompt={handleOnSavePrompt}
              onUnpinPrompt={handleOnUnpinPrompt}
              onEditPrompt={console.log}
              onRefinePrompt={console.log}
            />
          ))}
        </ChatForm>
      </Container>
      <FiltersSidebar />
    </Form>
  );
}

function FiltersSidebar() {
  const location = useLocation();
  const isDesktop = useMediaQuery(getCssVar("--screen-xl"));

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) return;
    setIsOpen(false);
  }, [location, isDesktop]);

  if (isDesktop) {
    return (
      <Sidebar
        className="sm:border-l-px sm:border-l-border"
        as="aside"
        resizeOptions={FILTERS_SIDEBAR_RESIZE_CONFIG}
      >
        <FilterTabs />
      </Sidebar>
    );
  }

  return (
    <Portal id={MOBILE_FILTERS_SIDEBAR_PORTAL_ID}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="w-full xl:hidden"
          >
            <Filter className="mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full overflow-auto border-l-0 px-0 pt-4 sm:w-96 sm:border-l">
          <SheetHeader>
            <SheetTitle className="px-2 pb-4 text-left">Filters</SheetTitle>
          </SheetHeader>
          <FilterTabs />
        </SheetContent>
      </Sheet>
    </Portal>
  );
}

function PromptEntry({
  data,
  onSavePrompt,
  onUnpinPrompt,
  onEditPrompt,
  onRefinePrompt,
}: {
  data: PromptSchema;
  onSavePrompt: (prompt: PromptSchema) => void;
  onUnpinPrompt: (prompt: SavedPrompt) => void;
  onEditPrompt: (prompt: PromptSchema | SavedPrompt) => void;
  onRefinePrompt: (prompt: PromptSchema | SavedPrompt) => void;
}) {
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
    ? new Date(Number((data as SavedPrompt).id)).toLocaleString()
    : "Temporary Prompt";

  const handleOnCopy = () => {
    const textDiv = promptContentRef.current;

    if (!textDiv) return;

    const range = document.createRange();
    range.selectNodeContents(textDiv);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const selectedText = selection.toString();

    copyFn(selectedText);
    selection.removeAllRanges();
  };

  return (
    <article className="rounded border p-2">
      <div className="flex flex-wrap items-start gap-2 pb-2">
        <p className="grow text-xl font-medium">{promptTitle}</p>
        <Button
          className="shrink-0"
          variant="outline"
          type="button"
          onClick={() => onRefinePrompt(data)}
        >
          <Wand2 className="mr-2" />
          Refine with AI
        </Button>
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
          title="Edit prompt"
          onClick={() => onEditPrompt(data)}
        >
          <Edit2 />
        </Button>
        <Button
          className="shrink-0"
          variant="secondary"
          size="icon"
          type="button"
          title="Pin prompt"
          onClick={() =>
            isSavedPrompt
              ? onUnpinPrompt(data as SavedPrompt)
              : onSavePrompt(data)
          }
        >
          {isSavedPrompt ? <PinOff /> : <Pin />}
        </Button>
      </div>
      <div ref={promptContentRef}>
        <p className="">{data.prompt}</p>
        {hasAppliedFilters && <PromptEntryFiltersSummary data={data} />}
      </div>
    </article>
  );
}

function PromptEntryFiltersSummary({
  data,
}: {
  data: PromptSchema | SavedPrompt;
}) {
  const { data: filterGroups } = useGetAllFilterGroups();

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

function ChatForm({
  children,
  onEnterPress,
}: {
  children?: React.ReactNode;
  onEnterPress?: () => void;
}) {
  return (
    <div className="grid min-h-full content-end space-y-4 pt-4">
      {children}
      <div className="sticky bottom-0 bg-background">
        <AppliedFilters />
        <ChatPrompt onEnterPress={onEnterPress} />
      </div>
    </div>
  );
}

function AppliedFilters() {
  const { control } = useFormContext();
  const watchedFilters = useWatch({ control, name: "filters" });

  const checkAllFiltersEmpty = () => {
    if (typeof watchedFilters !== "object") return false;

    const allFiltersEmpty = Object.values(watchedFilters).every((v) => {
      if (!v) return true;
      if (Array.isArray(v) && !v.length) return true;
      return false;
    });

    return allFiltersEmpty;
  };

  const getAppliedFiltersCount = () => {
    if (typeof watchedFilters !== "object") return 0;

    const count = Object.values(watchedFilters).reduce((acc: number, curr) => {
      if (!curr) return acc;
      if (Array.isArray(curr)) return acc + curr.length;
      return acc + 1;
    }, 0);

    return count;
  };

  if (checkAllFiltersEmpty()) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="applied_filters"
        className="overflow-hidden rounded border"
      >
        <AccordionTrigger className="p-2 text-xl focus-visible:outline-transparent [&[data-state=open]]:border-b">
          Applied Filters ({getAppliedFiltersCount()})
        </AccordionTrigger>
        <AccordionContent className="max-h-[50vh] min-h-20 space-y-4 overflow-auto p-2">
          <AppliedFiltersContent />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AppliedFiltersContent() {
  const { data } = useGetAllFilterGroups();

  const { control, setValue } = useFormContext();
  const watchedFilters = useWatch({ control, name: "filters" });

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

function ChatPrompt({ onEnterPress }: { onEnterPress?: () => void }) {
  const { control } = useFormContext();
  const { isSubmitting } = useFormState({ control });

  return (
    <div className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-[1fr_auto] sm:grid-rows-2 xl:grid-rows-1">
      <FormInput.Textarea
        name="prompt"
        placeholder="Proompt here..."
        formItemClassName="sm:row-span-full col-span-full sm:col-span-1"
        className="h-24 min-h-0 resize-none xl:h-16"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.shiftKey) return;
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onEnterPress?.();
          }
        }}
      />
      <Button
        type="submit"
        className="h-10 sm:h-12 xl:h-16"
        disabled={isSubmitting}
      >
        <MessageCircleQuestion className="mr-2" />
        Proompt
      </Button>
      <div id={MOBILE_FILTERS_SIDEBAR_PORTAL_ID} />
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
