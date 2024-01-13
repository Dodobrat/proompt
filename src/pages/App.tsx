import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Layout } from "@/components";
import { Toaster } from "@/components/ui";
import { ThemeProvider } from "@/context";
import { AppRoute } from "@/routes";

import { Project, Projects } from "./Projects";
import { Welcome } from "./Welcome";

// TODO: linkup with OpenAI

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={AppRoute.Root} element={<Layout />}>
      <Route index element={<Navigate replace to={AppRoute.Projects} />} />
      <Route path={AppRoute.Projects} element={<Projects />}>
        <Route index element={<Welcome />} />
        <Route path={AppRoute.Project} element={<Project />} />
      </Route>
      <Route path="*" element={<Navigate replace to={AppRoute.Root} />} />
    </Route>,
  ),
);

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        toast.error(error.message);
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
