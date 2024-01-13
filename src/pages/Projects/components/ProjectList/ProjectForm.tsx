import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Form, FormInput } from "@/components/form";
import { Button } from "@/components/ui";
import { AppSearchParamKeys } from "@/routes";
import { Project } from "@/types/projects";

const projectSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  projectName: z.string().min(2).max(50),
});

const defaultProjectValues = {
  projectName: "",
};

export function ProjectForm({
  defaultValues,
  onCreate,
  onUpdate,
  onCancel,
}: {
  defaultValues?: z.infer<typeof projectSchema> | null;
  onCreate?: (data: Project) => void;
  onUpdate?: (data: Project) => void;
  onCancel?: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setShow(true);
    }
  }, [defaultValues]);

  const hasCreateProjectSearchParam = searchParams.has(
    AppSearchParamKeys.CreateProject,
  );

  useEffect(() => {
    if (hasCreateProjectSearchParam) {
      setShow(true);
    }
  }, [hasCreateProjectSearchParam]);

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    const dataToSubmit = {
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (defaultValues) {
      onUpdate?.(dataToSubmit);
    }

    if (!defaultValues) {
      onCreate?.(dataToSubmit);
    }

    setShow(false);
  };

  return (
    <div className="grid gap-2">
      <Button
        variant={show ? "destructive" : "default"}
        onClick={() => {
          setShow((v) => !v);
          if (show) {
            setSearchParams((prev) => {
              if (prev.has(AppSearchParamKeys.CreateProject)) {
                prev.delete(AppSearchParamKeys.CreateProject);
              }
              return prev;
            });
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
