import { generatePath, NavLink } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/routes";
import { Project } from "@/types/projects";

type ProjectItemProps = {
  project: Project;
  onDelete?: (project: Project) => void;
  onEdit?: (project: Project) => void;
};

export function ProjectItem({ project, onDelete, onEdit }: ProjectItemProps) {
  return (
    <NavLink
      key={project.id}
      to={generatePath(AppRoute.Project, { id: project.id })}
      className={(props) =>
        cn(
          "grid grid-flow-col grid-cols-[1fr_auto_auto] items-start gap-2 rounded border p-2 pl-3 hover:bg-foreground/10 focus-visible:outline-transparent",
          props.isActive && "border-foreground",
        )
      }
    >
      {project.projectName}
      {Boolean(onEdit) && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit?.(project)}
          className="shrink-0"
        >
          <Edit2 />
        </Button>
      )}
      {Boolean(onDelete) && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete?.(project)}
          className="shrink-0"
        >
          <Trash2 />
        </Button>
      )}
    </NavLink>
  );
}
