import { Link, Outlet } from "react-router-dom";

import { ThemeProvider } from "@/context";
import { Routes } from "@/routes";

import { ThemeToggle } from "../ThemeToggle";
import { Toaster } from "../ui/sonner";

import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <ThemeProvider>
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
      <Toaster visibleToasts={5} />
    </ThemeProvider>
  );
}
