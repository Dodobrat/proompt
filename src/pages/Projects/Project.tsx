import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { SendHorizonal } from "lucide-react";
import { z } from "zod";

import { FilterType } from "@/api/filters";
import { Container } from "@/components";
import { Form, FormInput } from "@/components/form";
import {
  Button,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
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
});

type PromptSchema = z.infer<typeof promptSchema>;

export function Project() {
  const onSubmit = (data: PromptSchema) => {
    console.log(data);
  };

  return (
    <Form<typeof promptSchema>
      schema={promptSchema}
      onSubmit={onSubmit}
      className="flex grow items-start gap-2"
    >
      <Container className="self-end">
        <ChatForm></ChatForm>
      </Container>
      <Sidebar className="sm:border-l-px sm:border-l-border" as="aside">
        {/* <Filters /> */}
        <FilterTabs />
      </Sidebar>
    </Form>
  );
}

function ChatForm({ children }: { children?: React.ReactNode }) {
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
        placeholder="Your manual prompt here"
        hint="Type your manual prompt here or add filters and other nice things from the side"
        className="h-24 resize-none"
      />
      <div className="col-auto grid gap-2 py-1">
        <Button type="submit" size="icon" disabled={!isDirty}>
          <SendHorizonal />
        </Button>
        {/* <Button type="button" variant="outline" size="icon">
          <Filter />
        </Button> */}
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
              className="px-4 py-2"
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

        return (
          <TabsContent key={key} value={key}>
            {isGrid && (
              <FormInput.RadioGroup
                name={key}
                label=""
                className="grid gap-2 px-2 pb-2"
              >
                {value.data?.data?.map((v) => {
                  return (
                    <label htmlFor={v.name} key={v.name}>
                      <FormItem className="grid cursor-pointer grid-cols-[auto_1fr] content-start items-start gap-x-4 gap-y-1 rounded border p-2 hover:bg-foreground/5">
                        <FormControl>
                          <RadioGroupItem id={v.name} value={v.name} />
                        </FormControl>
                        <FormLabel className="pointer-events-none font-medium">
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
            )}
            {isList &&
              value.data?.data?.map((v) => {
                return (
                  <FormInput.RadioGroup
                    name={key}
                    label={v.name}
                    className="grid gap-2 px-2 pb-2"
                  >
                    {v.options?.map((o) => {
                      return (
                        <label htmlFor={o} key={o}>
                          <FormItem className="grid cursor-pointer grid-cols-[auto_1fr] content-start items-start gap-x-4 gap-y-1 rounded border p-2 hover:bg-foreground/5">
                            <FormControl>
                              <RadioGroupItem id={o} value={o} />
                            </FormControl>
                            <FormLabel className="pointer-events-none font-medium">
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
      })}
    </Tabs>
  );
}
