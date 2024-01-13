import { useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { MessageCircleQuestion, Settings } from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle, useSessionStorage } from "usehooks-ts";
import { z } from "zod";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/routes";
import { Project } from "@/types/projects";

import { Form, FormInput } from "../form";
import { ThemeToggle } from "../ThemeToggle";
import { Button, Popover, PopoverContent, PopoverTrigger } from "../ui";

import { Navbar } from "./Navbar";

export const NAVBAR_PORTAL_SLOT_ID = "navbar-portal-start";

export function Layout() {
  const params = useParams();

  const { value: storedProjects } = useLocalStorage<Project[]>(
    DB.KEYS.PROJECTS,
    [],
  );

  const projectName = storedProjects.find((p) => p.id === params.id)
    ?.projectName;

  const pageTitle = projectName ? ` - ${projectName}` : "";

  useDocumentTitle(`Proompt${pageTitle}`);

  return (
    <>
      <Navbar>
        <div className="flex w-full items-center gap-2">
          <div id={NAVBAR_PORTAL_SLOT_ID} />
          <Link
            to={AppRoute.Root}
            className="mr-auto line-clamp-2 leading-tight"
          >
            <p className="font-bold sm:text-xl">
              <Logo />
              {pageTitle}
            </p>
          </Link>
          <ThemeToggle />
          <ApiKeyForm />
        </div>
      </Navbar>
      <main className="grid min-h-screen pt-16">
        <Outlet />
      </main>
    </>
  );
}

function ApiKeyForm() {
  const [apiKeyFormOpen, setApiKeyFormOpen] = useState(false);

  const [sessionApiKey, setSessionApiKey] = useSessionStorage(
    DB.KEYS.SESSION_API_KEY,
    null,
  );

  return (
    <Popover open={apiKeyFormOpen} onOpenChange={setApiKeyFormOpen}>
      <PopoverTrigger asChild>
        <Button size="icon">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(30rem,calc(100vw_-_1rem))] p-2"
        collisionPadding={{ right: 8, left: 8 }}
      >
        <Form
          className="grid gap-2"
          defaultValues={sessionApiKey ? { apiKey: sessionApiKey } : undefined}
          schema={z.object({ apiKey: z.string() })}
          onSubmit={(data) => {
            setSessionApiKey(data.apiKey);
            toast.success("API Key saved to current session");
            setApiKeyFormOpen(false);
          }}
        >
          <FormInput
            name="apiKey"
            label="OpenAI API KEY"
            hint="Once you close the tab, the key will be forgotten for security"
          />
          <Button className="w-max">Save for session</Button>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>Pro</span>
      <MessageCircleQuestion className="h-full w-[0.9em]" />
      <span>mpt</span>
    </span>
  );
}
