import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Container, Logo } from "@/components";
import { Button } from "@/components/ui";
import { AppSearchParamKeys } from "@/routes";

export function Welcome() {
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.missingProjectId) {
      toast.error(
        `Project "${location.state.missingProjectId}" does not exist`,
        { id: "missing-project-toast" },
      );
    }
  }, [location.state]);

  return (
    <Container className="grid h-full grow content-start gap-6 py-12 text-center lg:gap-10 lg:py-20">
      <h1 className="text-center text-2xl font-bold lg:text-5xl">
        <span>Welcome to</span>
        <br />
        <Logo className="text-5xl lg:text-8xl" />
      </h1>
      <div className="mx-auto max-w-screen-sm text-balance lg:text-xl">
        <span>
          This is a prompt management tool that uses OpenAI's ChatGPT to help
          you write meaningful prompts for image generation.
        </span>
        <div className="grid items-center justify-center gap-4 pt-6 text-base md:grid-cols-[1fr_auto_1fr]">
          <ol className="grid list-inside list-decimal gap-2 rounded border bg-muted p-2 text-left marker:font-bold">
            <li>Create a project</li>
            <li>Select filters + prompt</li>
            <li>Pin or copy your prompts</li>
          </ol>
          <strong>and</strong>
          <ol className="grid list-inside list-decimal gap-2 rounded border bg-muted p-2 text-left marker:font-bold">
            <li>Add an api key from OpenAI</li>
            <li>Refine prompts using AI</li>
            <li>Pin or copy your prompts</li>
          </ol>
        </div>
      </div>
      <div className="mx-auto inline-flex flex-col items-center gap-2 sm:flex-row">
        <Button
          className="w-min"
          onClick={() =>
            setSearchParams({ [AppSearchParamKeys.CreateProject]: "true" })
          }
        >
          Create a new project
        </Button>
        <span>
          and start <Logo />
          ing
        </span>
      </div>
    </Container>
  );
}
