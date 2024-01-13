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
      <p className="mx-auto max-w-screen-sm text-balance lg:text-xl">
        This is a prompt management tool that uses OpenAI's ChatGPT to help you
        write meaningful prompts for image generation.
      </p>
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
