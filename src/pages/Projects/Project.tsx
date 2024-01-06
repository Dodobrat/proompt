import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { SendHorizonal, X } from "lucide-react";
import { z } from "zod";

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
import { useGetAllGroupedFilters } from "@/hooks/query";

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
  const filters = useGetAllGroupedFilters();
  console.log(filters);

  return null;

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
    <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
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

// function FilterInput({
//   value,
//   onValueChange,
// }: {
//   value: string;
//   onValueChange: (value: string) => void;
// }) {
//   const searchRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className="relative px-2">
//       <Search className="pointer-events-none absolute inset-y-0 left-4 h-full opacity-50" />
//       <Input
//         className="px-10"
//         placeholder="Filter by name"
//         value={value}
//         onChange={({ target }) => onValueChange(target.value)}
//         ref={searchRef}
//       />
//       {Boolean(value) && (
//         <Button
//           variant="ghost"
//           size="icon"
//           type="button"
//           onClick={() => {
//             onValueChange("");
//             searchRef.current?.focus();
//           }}
//           className="absolute inset-y-0 right-2"
//         >
//           <X />
//         </Button>
//       )}
//     </div>
//   );
// }

// function NoResults() {
//   return (
//     <div className="grid gap-1 py-4 text-center">
//       <div className="text-2xl font-bold">No Results</div>
//       <div className="text-base">Try another search</div>
//     </div>
//   );
// }

// function GridFilters({
//   data,
//   filterKey,
// }: {
//   data: Entry[];
//   filterKey: string;
// }) {
//   const [search, setSearch] = useState("");

//   const filteredData = search
//     ? data.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
//     : data;

//   const hasNoResults = Boolean(search) && !filteredData?.length;

//   return (
//     <TabsContent value={filterKey}>
//       <FilterInput value={search} onValueChange={setSearch} />

//       {hasNoResults && <NoResults />}

//       <FormInput.RadioGroup
//         name={`filters.${filterKey}`}
//         className="grid gap-2 px-2 pb-2"
//         formItemClassName="pt-2"
//       >
//         {filteredData?.map((v) => {
//           return (
//             <label htmlFor={v.name} key={v.name}>
//               <FormItem className="grid cursor-pointer grid-cols-[auto_1fr] content-start items-start gap-x-4 gap-y-1 rounded border py-4 pl-3 pr-2 hover:bg-foreground/5">
//                 <FormControl className="mt-1">
//                   <RadioGroupItem id={v.name} value={v.name} />
//                 </FormControl>
//                 <FormLabel className="pointer-events-none text-base font-medium leading-tight">
//                   {v.name}
//                 </FormLabel>
//                 {Boolean(v.description) && (
//                   <FormDescription className="pointer-events-none col-start-2">
//                     {v.description}
//                   </FormDescription>
//                 )}
//               </FormItem>
//             </label>
//           );
//         })}
//       </FormInput.RadioGroup>
//     </TabsContent>
//   );
// }

// function ListFilters({
//   data,
//   filterKey,
// }: {
//   data: OptionsEntry[];
//   filterKey: string;
// }) {
//   const [search, setSearch] = useState("");

//   const filteredByGroup = data?.reduce((acc: Record<string, number>, curr) => {
//     acc[curr.name] = curr.options?.filter((o) =>
//       o.toLowerCase().includes(search.toLowerCase()),
//     ).length;
//     return acc;
//   }, {});

//   const hasNoResults =
//     Boolean(search) && Object.values(filteredByGroup).every((v) => !v);

//   return (
//     <TabsContent value={filterKey}>
//       <FilterInput value={search} onValueChange={setSearch} />

//       {hasNoResults && <NoResults />}

//       {data?.map((v) => {
//         const name = `filters.${filterKey}.${v.filterName}`;

//         const filteredOptions = search
//           ? v.options?.filter((o) =>
//               o.toLowerCase().includes(search.toLowerCase()),
//             )
//           : v.options;

//         if (!filteredOptions?.length) return null;

//         return (
//           <div key={name} className="m-2 grid rounded border pb-2">
//             <p className="py-2 pl-4 text-xl font-medium">{v.name}</p>
//             {filteredOptions?.map((o) => (
//               <ListGroupFilters key={o} option={o} name={name} />
//             ))}
//           </div>
//         );
//       })}
//     </TabsContent>
//   );
// }

// function ListGroupFilters({ option, name }: { option: string; name: string }) {
//   const { control, setValue } = useFormContext();
//   const watchedFilters = useWatch({ control, name });

//   const value: string[] = watchedFilters ?? [];

//   return (
//     <label htmlFor={option} key={option}>
//       <FormInput.Checkbox
//         name={option}
//         label={option}
//         id={option}
//         formItemClassName="space-y-0 flex flex-row-reverse justify-end items-start gap-2 p-4 cursor-pointer hover:bg-foreground/5"
//         formLabelClassName="pointer-events-none text-base font-medium leading-tight -mt-0.5"
//         checked={value.includes(option)}
//         onCheckedChange={(isChecked) => {
//           if (isChecked) {
//             return setValue(name, [...value, option]);
//           }
//           setValue(
//             name,
//             value.filter((v) => v !== option),
//           );
//         }}
//       />
//     </label>
//   );
// }
