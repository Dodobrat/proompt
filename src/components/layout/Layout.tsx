import { Link, Outlet, useParams } from "react-router-dom";
import { useDocumentTitle } from "usehooks-ts";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { Routes } from "@/routes";
import { Project } from "@/types/projects";

import { ThemeToggle } from "../ThemeToggle";

import { Navbar } from "./Navbar";

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
        <div className="flex w-full items-center justify-between gap-2">
          <Link to={Routes.Root}>
            <p className="text-xl font-bold">{pageTitle}</p>
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
