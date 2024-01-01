import { Link, Outlet } from "react-router-dom";

import { Routes } from "@/routes";

import { ThemeToggle } from "../ThemeToggle";

import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <>
      <Navbar>
        <div className="flex w-full items-center justify-between gap-2">
          <Link to={Routes.Root}>
            <p className="text-xl font-bold">Proompt</p>
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
