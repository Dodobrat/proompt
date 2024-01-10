import { Link, Outlet, useParams } from "react-router-dom";
import { useDocumentTitle } from "usehooks-ts";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { Routes } from "@/routes";
import { Project } from "@/types/projects";

import { ThemeToggle } from "../ThemeToggle";

import { Navbar } from "./Navbar";

export const NAVBAR_PORTAL_START_ID = "navbar-portal-start";

export function Layout() {
  const params = useParams();

  const { value: storedProjects } = useLocalStorage<Project[]>(
    DB.KEYS.PROJECTS,
    [],
  );

  const projectName = storedProjects.find((p) => p.id === params.id)
    ?.projectName;

  const pageTitle = `Proompt${projectName ? ` - ${projectName}` : ""}`;

  useDocumentTitle(pageTitle);

  return (
    <>
      <Navbar>
        <div className="flex w-full items-center gap-2">
          <div id={NAVBAR_PORTAL_START_ID} />
          <Link to={Routes.Root} className="mr-auto line-clamp-2 leading-tight">
            <p className="text-sm font-bold sm:text-xl">{pageTitle}</p>
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
