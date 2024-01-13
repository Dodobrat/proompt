import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { List } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { NAVBAR_PORTAL_SLOT_ID, Portal } from "@/components";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import { DB } from "@/lib/db";
import { getCssVar } from "@/lib/utils";
import { AppSearchParamKeys } from "@/routes";

import { ProjectsList, ResizeDirection, Sidebar } from "./components";

export function Projects() {
  return (
    <div className="flex items-end gap-2 xl:items-start">
      <ProjectListWrapper />
      <Outlet />
    </div>
  );
}

const PROJECTS_SIDEBAR_RESIZE_CONFIG = {
  minWidth: 300,
  maxWidth: 500,
  direction: ResizeDirection.LeftToRight,
  storageKey: DB.KEYS.PROJECTS_SIDEBAR_WIDTH,
};

function ProjectListWrapper() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(getCssVar("--screen-2xl"));

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) return;
    if (searchParams.has(AppSearchParamKeys.CreateProject)) {
      setTimeout(() => setIsOpen(true));
    }
  }, [searchParams, isDesktop]);

  useEffect(() => {
    if (isDesktop) return;
    setIsOpen(false);
  }, [location, isDesktop]);

  if (isDesktop) {
    return (
      <Sidebar
        className="sm:border-r-px sm:border-r-border"
        resizeOptions={PROJECTS_SIDEBAR_RESIZE_CONFIG}
      >
        <ProjectsList />
      </Sidebar>
    );
  }

  return (
    <Portal id={NAVBAR_PORTAL_SLOT_ID}>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (isDesktop) return;
          if (open) return;
          setSearchParams((prev) => {
            if (prev.has(AppSearchParamKeys.CreateProject)) {
              prev.delete(AppSearchParamKeys.CreateProject);
            }
            return prev;
          });
        }}
      >
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <List />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full overflow-auto border-r-0 px-0 pt-4 sm:w-96 sm:border-r"
        >
          <SheetHeader>
            <SheetTitle className="px-2 pb-2 text-left">Projects</SheetTitle>
          </SheetHeader>
          <ProjectsList />
        </SheetContent>
      </Sheet>
    </Portal>
  );
}
