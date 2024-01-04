import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { Search, SendHorizonal, X } from "lucide-react";
import { z } from "zod";

import { Entry, FilterType, OptionsEntry } from "@/api/filters";
import { Container } from "@/components";
import { Form, FormInput } from "@/components/form";
import {
  Button,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  Input,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useGetAllFilters } from "@/hooks/query";

import { Sidebar } from "./components";

const promptSchema = z.object({
  prompt: z.string().min(2).max(500),
  filters: z
    .object({
      angles: z.string().optional(),
      architects: z.string().optional(),
      interiorDesigners: z.string().optional(),
      roomTypes: z.string().optional(),
      architecture: z
        .object({
          commercial: z.string().optional(),
          facade: z.string().optional(),
          residential: z.string().optional(),
          shape: z.string().optional(),
          style: z.string().optional(),
        })
        .optional(),
      furniture: z
        .object({
          artDeco: z.string().optional(),
          contemporary: z.string().optional(),
          industrial: z.string().optional(),
          midCenturyModern: z.string().optional(),
          traditional: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

type PromptSchema = z.infer<typeof promptSchema>;

const defaultPromptValues: PromptSchema = {
  prompt: "",
  filters: {
    angles: "",
    architects: "",
    interiorDesigners: "",
    roomTypes: "",
    architecture: {
      commercial: "",
      facade: "",
      residential: "",
      shape: "",
      style: "",
    },
    furniture: {
      artDeco: "",
      contemporary: "",
      industrial: "",
      midCenturyModern: "",
      traditional: "",
    },
  },
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
        <ChatForm></ChatForm>
      </Container>
      <Sidebar className="sm:border-l-px sm:border-l-border" as="aside">
        <FilterTabs />
      </Sidebar>
    </Form>
  );
}

function ChatForm({ children }: { children?: React.ReactNode }) {
  // const { control } = useFormContext();
  // const watchedFilters = useWatch({ control, name: "filters" });

  return (
    <div className="grid min-h-full content-end gap-4">
      {children}
      <ChatPrompt />
    </div>
  );
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
  const filters = useGetAllFilters();

  const [selectedTab, setSelectedTab] = useState<string>(
    Object.entries(filters)[0][0] || "",
  );

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

  return (
    <Tabs
      defaultValue={selectedTab}
      onValueChange={setSelectedTab}
      className="overflow-hidden"
    >
      <TabsList className="flex h-auto w-full justify-start overflow-auto rounded-none">
        {Object.entries(filters).map(([key, value]) => {
          return (
            <TabsTrigger
              key={key}
              value={key}
              id={key}
              className="px-4 py-4"
              type="button"
              ref={addElToRef}
            >
              {value.data?.meta?.filterTitle?.toUpperCase()}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {Object.entries(filters).map(([key, value]) => {
        const filterType = value.data?.meta?.filterType;

        const isGrid = filterType === FilterType.Grid;
        const isList = filterType === FilterType.List;

        if (isGrid) {
          const data = value.data?.data as Entry[];

          return <GridFilters key={key} data={data} filterKey={key} />;
        }

        if (isList) {
          const data = value.data?.data as OptionsEntry[];

          return <ListFilters key={key} data={data} filterKey={key} />;
        }

        return "Unhandled Filter";
      })}
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

function GridFilters({
  data,
  filterKey,
}: {
  data: Entry[];
  filterKey: string;
}) {
  const [search, setSearch] = useState("");

  const filteredData = search
    ? data.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <TabsContent value={filterKey}>
      <FilterInput value={search} onValueChange={setSearch} />
      <FormInput.RadioGroup
        name={`filters.${filterKey}`}
        label=""
        className="grid gap-2 px-2 pb-2"
        formItemClassName="pt-2"
      >
        {filteredData?.map((v) => {
          return (
            <label htmlFor={v.name} key={v.name}>
              <FormItem className="grid cursor-pointer grid-cols-[auto_1fr] content-start items-start gap-x-4 gap-y-1 rounded border py-4 pl-3 pr-2 hover:bg-foreground/5">
                <FormControl className="mt-1">
                  <RadioGroupItem id={v.name} value={v.name} />
                </FormControl>
                <FormLabel className="pointer-events-none text-base font-medium leading-tight">
                  {v.name}
                </FormLabel>
                {Boolean(v.description) && (
                  <FormDescription className="pointer-events-none col-start-2">
                    {v.description}
                  </FormDescription>
                )}
              </FormItem>
            </label>
          );
        })}
      </FormInput.RadioGroup>
    </TabsContent>
  );
}

function ListFilters({
  data,
  filterKey,
}: {
  data: OptionsEntry[];
  filterKey: string;
}) {
  const [search, setSearch] = useState("");

  return (
    <TabsContent value={filterKey}>
      <FilterInput value={search} onValueChange={setSearch} />

      {data?.map((v) => {
        const name = `filters.${filterKey}.${v.filterName}`;

        const filteredOptions = search
          ? v.options?.filter((o) =>
              o.toLowerCase().includes(search.toLowerCase()),
            )
          : v.options;

        if (!filteredOptions?.length) return null;

        return (
          <FormInput.RadioGroup
            name={name}
            key={name}
            label={v.name}
            className="mb-2 grid gap-0"
            formItemClassName="grid gap-2 space-y-0 pb-2 border rounded m-2"
            formLabelClassName="text-xl pt-2 pb-0 pl-4"
          >
            {filteredOptions?.map((o) => {
              return (
                <label htmlFor={o} key={o}>
                  <FormItem className="grid cursor-pointer grid-cols-[auto_1fr] content-start items-start gap-x-4 gap-y-1 py-4 pl-3 pr-2 hover:bg-foreground/5">
                    <FormControl className="mt-1">
                      <RadioGroupItem id={o} value={o} />
                    </FormControl>
                    <FormLabel className="pointer-events-none text-base font-medium leading-tight">
                      {o}
                    </FormLabel>
                  </FormItem>
                </label>
              );
            })}
          </FormInput.RadioGroup>
        );
      })}
    </TabsContent>
  );
}
