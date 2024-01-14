import { useEffect, useRef, useState } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { AppRoute } from "@/routes";
import { Project } from "@/types/projects";

import { ProjectForm } from "./ProjectForm";
import { ProjectItem } from "./ProjectListItem";

export function ProjectsList() {
  const navigate = useNavigate();
  const params = useParams();

  const isDeletingRef = useRef(false);

  const [projectForEdit, setProjectForEdit] = useState<Project | null>(null);
  const {
    setValue: setStoredProjects,
    getValue: getLatestStoredProjects,
    removeValue,
  } = useLocalStorage<Project[]>(DB.KEYS.PROJECTS, []);

  useEffect(() => {
    if (!params.id) return;

    const projectExists = getLatestStoredProjects().find(
      (p) => p.id === params.id,
    );

    if (!projectExists) {
      navigate(
        generatePath(AppRoute.Projects),
        isDeletingRef.current ? {} : { state: { missingProjectId: params.id } },
      );
    }
  }, [getLatestStoredProjects, navigate, params.id]);

  const deleteProject = (project: Project) => {
    setStoredProjects((prev) => {
      toast.success(`Project "${project.projectName}" deleted successfully`);
      return prev.filter((p) => p.id !== project.id);
    });
    removeValue(DB.KEYS.PROJECT_KEY_FILTERS(project.id));
    isDeletingRef.current = true;
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

    navigate(generatePath(AppRoute.Project, { id: project.id }));
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

    navigate(generatePath(AppRoute.Project, { id: project.id }));
    setProjectForEdit(null);
  };

  return (
    <div className="p-2">
      <ProjectForm
        defaultValues={projectForEdit}
        onCreate={createProject}
        onUpdate={updateProject}
        onCancel={() => setProjectForEdit(null)}
      />
      <div className="grid gap-2 py-2">
        {getLatestStoredProjects().map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            onEdit={setProjectForEdit}
            onDelete={deleteProject}
          />
        ))}
      </div>
    </div>
  );
}
