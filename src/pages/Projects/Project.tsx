import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { useLocation, useParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { useMediaQuery, useUpdateEffect } from "usehooks-ts";

import { Container, Logo, Portal } from "@/components";
import { Form, FormInput } from "@/components/form";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { getCssVar } from "@/lib/utils";

import { PromptSchema, promptSchema, PromptType } from "./schemas/promptSchema";
import {
  AppliedFilters,
  FilterTabs,
  PromptsList,
  ResizeDirection,
  Sidebar,
} from "./components";

const MOBILE_FILTERS_SIDEBAR_PORTAL_ID = "mobile-filters-sidebar-portal";

const FILTERS_SIDEBAR_RESIZE_CONFIG = {
  minWidth: 300,
  maxWidth: 700,
  direction: ResizeDirection.RightToLeft,
  storageKey: DB.KEYS.FILTERS_SIDEBAR_WIDTH,
};

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

  const { getValue: getLatestStoredProjectPrompts } = useLocalStorage<
    PromptSchema[]
  >(DB.KEYS.PROJECT_KEY_PROMPTS(params.id!), []);

  const [temporaryPrompts, setTemporaryPrompts] = useState(() =>
    getLatestStoredProjectPrompts(),
  );

  useUpdateEffect(() => {
    setTemporaryPrompts(getLatestStoredProjectPrompts());
  }, [params.id]);

  const onSubmit = (data: PromptSchema) => {
    setStoredProjectFilters(data);

    const promptTimestamp = new Date().getTime();

    const promptData = {
      ...structuredClone(data),
      id: promptTimestamp.toString(),
      timestamp: promptTimestamp,
      type: PromptType.Temporary,
    };

    setTemporaryPrompts((prev) => [...prev, promptData]);
  };

  const handleOnEnterPress = () => {
    if (!formRef.current) return;
    // SUBMIT FORM ON ENTER PRESS (SHIFT + ENTER TO ADD NEW LINE)
    formRef.current.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
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
        <ChatPrompt onEnterPress={handleOnEnterPress}>
          <PromptsList
            temporaryPrompts={temporaryPrompts}
            setTemporaryPrompts={setTemporaryPrompts}
          />
        </ChatPrompt>
      </Container>
      <FiltersSidebar />
    </Form>
  );
}

type ChatPromptProps = {
  children?: React.ReactNode;
  onEnterPress?: () => void;
};

function ChatPrompt({ children, onEnterPress }: ChatPromptProps) {
  const { control } = useFormContext();
  const { isSubmitting, submitCount } = useFormState({ control });

  const scrollResetterRef = useRef<HTMLDivElement>(null);

  useUpdateEffect(() => {
    if (scrollResetterRef.current) {
      scrollResetterRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [submitCount]);

  return (
    <div className="grid min-h-full content-end space-y-4 pt-4">
      {children}
      <div className="sticky bottom-0 bg-background">
        <AppliedFilters />
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
            <Logo />
          </Button>
          <div id={MOBILE_FILTERS_SIDEBAR_PORTAL_ID} />
        </div>
      </div>
      <div ref={scrollResetterRef} />
    </div>
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
