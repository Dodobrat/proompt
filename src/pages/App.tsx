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

import { Container, Layout } from "@/components";
import { Toaster } from "@/components/ui";
import { ThemeProvider } from "@/context";
import { Routes } from "@/routes";

import { Project, Projects } from "./Projects";

// TODO: Add Sheet and filter groups ( Projects DONE )
// TODO: linkup with OpenAI

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Routes.Root} element={<Layout />}>
      <Route index element={<Navigate replace to={Routes.Projects} />} />
      <Route path={Routes.Projects} element={<Projects />}>
        <Route index element={<Container>CLICK A PROJECT</Container>} />
        <Route path={Routes.Project} element={<Project />} />
      </Route>
      <Route path="*" element={<Navigate replace to={Routes.Root} />} />
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
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
