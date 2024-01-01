import { useState } from "react";
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

  console.log(params);

  return (
    <Sidebar className="sm:border-r-px sm:border-r-border">
      <div className="p-2">
        <AddForm onCreate={() => setProjects(initProjects)} />
        <Separator className="my-2" />
        <div className="grid gap-2 pb-4">
          {projects.map((project) => (
            <div key={project.id} className="flex w-full gap-2">
              <Button
                asChild
                variant={params?.id === project.id ? "secondary" : "ghost"}
                className="grow justify-start"
              >
                <Link to={generatePath(Routes.Project, { id: project.id })}>
                  {project.projectName}
                </Link>
              </Button>
              <Button size="icon" variant="outline">
                <Edit2 />
              </Button>
              <Button size="icon" variant="destructive">
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
}: {
  defaultValues?: z.infer<typeof projectSchema>;
  onCreate?: (data: z.infer<typeof projectSchema>) => void;
  onUpdate?: (data: z.infer<typeof projectSchema>) => void;
}) {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    if (defaultValues) {
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
        onClick={() => setShow((v) => !v)}
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
