import { useEffect, useState } from "react";
import {
  generatePath,
  Link,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormInput } from "@/components/form";
import { Button, Separator } from "@/components/ui";
import { DB } from "@/lib/db";
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

function initProjects() {
  return DB.get({ key: DB.KEYS.PROJECTS }) ?? [];
}

function ProjectsList() {
  const params = useParams();
  const [projects, setProjects] = useState<Project[]>(initProjects);
  const [projectForEdit, setProjectForEdit] = useState<Project | null>(null);

  const deleteProject = (project: Project) => () => {
    DB.deleteEntry({
      key: DB.KEYS.PROJECTS,
      matcherFn: (p: Project) => p.id !== project.id,
      onError: () => toast.error("Failed to delete project"),
      onSuccess: () => {
        toast.success(`Project "${project.projectName}" deleted successfully`);
        setProjects(initProjects);
      },
    });
  };

  return (
    <Sidebar className="sm:border-r-px sm:border-r-border">
      <div className="px-2 py-4">
        <AddForm
          defaultValues={projectForEdit}
          onCreate={() => setProjects(initProjects)}
          onUpdate={() => setProjects(initProjects)}
          onCancel={() => setProjectForEdit(null)}
        />
        <Separator className="my-4" />
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="grid grid-flow-col grid-cols-[1fr_auto_auto] items-start gap-2"
            >
              <Button
                asChild
                variant={params?.id === project.id ? "secondary" : "ghost"}
                className="grow justify-start truncate"
              >
                <Link to={generatePath(Routes.Project, { id: project.id })}>
                  {project.projectName}
                </Link>
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setProjectForEdit(project)}
                className="shrink-0"
              >
                <Edit2 />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={deleteProject(project)}
                className="shrink-0"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}

const projectSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  projectName: z.string().min(2).max(50),
});

const defaultProjectValues = {
  projectName: "",
};

function createValidator(data: z.infer<typeof projectSchema>) {
  return function (projects: Project[]) {
    return projects.reduce((acc, curr) => {
      if (curr.projectName === data.projectName) {
        return true;
      }
      return acc;
    }, false);
  };
}

function AddForm({
  defaultValues,
  onCreate,
  onUpdate,
  onCancel,
}: {
  defaultValues?: z.infer<typeof projectSchema> | null;
  onCreate?: (data: z.infer<typeof projectSchema>) => void;
  onUpdate?: (data: z.infer<typeof projectSchema>) => void;
  onCancel?: () => void;
}) {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (defaultValues) {
      setShow(true);
    }
  }, [defaultValues]);

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    if (defaultValues) {
      const dataToSubmit = {
        ...defaultValues,
        ...data,
      };

      DB.update({
        key: DB.KEYS.PROJECTS,
        data: dataToSubmit,
        matcherFn: (project: Project) => project.id === dataToSubmit.id,
        onError: () => toast.error("Failed to update project"),
        onSuccess: () => {
          toast.success(`Project "${data.projectName}" updated successfully`);
          setShow(false);
          if (dataToSubmit.id) {
            navigate(generatePath(Routes.Project, { id: dataToSubmit.id }));
          }
        },
      });

      return onUpdate?.(data);
    }

    const dataToSubmit = {
      ...data,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };

    DB.safeCreate({
      key: DB.KEYS.PROJECTS,
      data: dataToSubmit,
      validator: createValidator(data),
      onError: () => toast.error("Project already exists"),
      onSuccess: () => {
        toast.success(`Project "${data.projectName}" created successfully`);
        setShow(false);
        navigate(generatePath(Routes.Project, { id: dataToSubmit.id }));
      },
    });

    onCreate?.(data);
  };

  return (
    <div className="grid gap-2">
      <Button
        variant={show ? "destructive" : "outline"}
        onClick={() => {
          setShow((v) => !v);
          onCancel?.();
        }}
      >
        {show ? "Cancel Creation" : "Create New Project"}
      </Button>
      {show && (
        <Form
          schema={projectSchema}
          onSubmit={onSubmit}
          className="grid gap-2"
          defaultValues={defaultValues ?? defaultProjectValues}
        >
          <FormInput name="projectName" label="Project Name" autoFocus />
          <Button>Create</Button>
        </Form>
      )}
    </div>
  );
}
