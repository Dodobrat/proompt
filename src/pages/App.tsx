import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "@/components";
import { Routes } from "@/routes";

import { Project, Projects } from "./Projects";

// TODO: Add filter context
// TODO: Add Text area submit on Enter
// TODO: Add Sheet and filter groups
// TODO: linkup with OpenAI
// TODO: Copy to clipboard btn
// clearable badges ( like online store )

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Routes.Root} element={<Layout />}>
      <Route index element={<Navigate replace to={Routes.Projects} />} />
      <Route path={Routes.Projects} element={<Projects />}>
        <Route index element={<div>ROOT</div>} />
        <Route path={Routes.Project} element={<Project />} />
      </Route>
      <Route path="*" element={<Navigate replace to={Routes.Root} />} />
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
