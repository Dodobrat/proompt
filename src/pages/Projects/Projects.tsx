import { useEffect, useState } from "react";
import {
  generatePath,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormInput } from "@/components/form";
import { Button } from "@/components/ui";
import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes";
import { Project } from "@/types/projects";

import { Sidebar } from "./components";

export function Projects() {
  return (
    <div className="flex items-start gap-2">
      <ProjectsList />
      <Outlet />
    </div>
  );
}

function ProjectsList() {
  const navigate = useNavigate();
  const params = useParams();

  const [projectForEdit, setProjectForEdit] = useState<Project | null>(null);
  const [, setStoredProjects, getLatestStoredProjects] = useLocalStorage<
    Project[]
  >(DB.KEYS.PROJECTS, []);

  useEffect(() => {
    if (!params.id) return;

    const projectExists = getLatestStoredProjects().find(
      (p) => p.id === params.id,
    );

    if (!projectExists) {
      navigate(generatePath(Routes.Projects));
    }
  }, [getLatestStoredProjects, navigate, params.id]);

  const deleteProject = (project: Project) => () => {
    setStoredProjects((prev) => {
      toast.success(`Project "${project.projectName}" deleted successfully`);
      return prev.filter((p) => p.id !== project.id);
    });
  };

  const createProject = (project: Project) => {
    setStoredProjects((prev) => {
      if (prev.find((p) => p.projectName === project.projectName)) {
        toast.error(`Project "${project.projectName}" already exists`);
        return prev;
      }
      toast.success(`Project "${project.projectName}" created successfully`);
      return [...prev, project];
    });

    navigate(generatePath(Routes.Project, { id: project.id }));
    setProjectForEdit(null);
  };

  const updateProject = (project: Project) => {
    setStoredProjects((prev) => {
      if (prev.find((p) => p.projectName === project.projectName)) {
        toast.error(`Project "${project.projectName}" already exists`);
        return prev;
      }
      toast.success(`Project "${project.projectName}" updated successfully`);
      return prev.map((p) => (p.id === project.id ? project : p));
    });

    navigate(generatePath(Routes.Project, { id: project.id }));
    setProjectForEdit(null);
  };

  return (
    <Sidebar className="sm:border-r-px sm:border-r-border">
      <div className="p-2">
        <ProjectForm
          defaultValues={projectForEdit}
          onFormSubmit={projectForEdit ? updateProject : createProject}
          onCancel={() => setProjectForEdit(null)}
        />
        <div className="grid gap-2 py-2">
          {getLatestStoredProjects().map((project) => (
            <NavLink
              key={project.id}
              to={generatePath(Routes.Project, { id: project.id })}
              className={(props) =>
                cn(
                  "grid grid-flow-col grid-cols-[1fr_auto_auto] items-start gap-2 rounded border p-2 pl-3 hover:bg-foreground/10",
                  props.isActive && "border-foreground",
                )
              }
            >
              {project.projectName}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setProjectForEdit(project)}
                className="shrink-0"
              >
                <Edit2 />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={deleteProject(project)}
                className="shrink-0"
              >
                <Trash2 />
              </Button>
            </NavLink>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}

const projectSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  projectName: z.string().min(2).max(50),
});

const defaultProjectValues = {
  projectName: "",
};

function ProjectForm({
  defaultValues,
  onFormSubmit,
  onCancel,
}: {
  defaultValues?: z.infer<typeof projectSchema> | null;
  onFormSubmit?: (data: Project) => void;
  onCancel?: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setShow(true);
    }
  }, [defaultValues]);

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    const dataToSubmit = {
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    onFormSubmit?.(dataToSubmit);
    setShow(false);
  };

  return (
    <div className="grid gap-2">
      <Button
        variant={show ? "destructive" : "outline"}
        onClick={() => {
          setShow((v) => !v);
          if (show) {
            onCancel?.();
          }
        }}
      >
        {show && !defaultValues && "Cancel Creation"}
        {show && defaultValues && "Cancel Edit"}
        {!show && "Create New Project"}
      </Button>
      {show && (
        <Form
          schema={projectSchema}
          onSubmit={onSubmit}
          className="grid gap-2 pb-2"
          defaultValues={defaultValues ?? defaultProjectValues}
        >
          <FormInput name="projectName" label="Project Name" autoFocus />
          <Button>{defaultValues ? "Update" : "Create"}</Button>
        </Form>
      )}
    </div>
  );
}
