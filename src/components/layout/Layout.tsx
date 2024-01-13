import { Link, Outlet, useParams } from "react-router-dom";
import { MessageCircleQuestion } from "lucide-react";
import { useDocumentTitle } from "usehooks-ts";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/routes";
import { Project } from "@/types/projects";

import { ThemeToggle } from "../ThemeToggle";

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
        </div>
      </Navbar>
      <main className="grid min-h-screen pt-16">
        <Outlet />
      </main>
    </>
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
