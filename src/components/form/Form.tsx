import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormProps<T extends z.ZodSchema> = {
  children: React.ReactNode;
  schema: z.ZodSchema;
  onSubmit: SubmitHandler<z.infer<T>>;
  defaultValues?: z.infer<T>;
  className?: string;
  id?: string;
};

export function Form<TSchema extends z.ZodSchema>({
  id,
  className,
  schema,
  children,
  onSubmit,
  defaultValues,
}: FormProps<TSchema>) {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        className={className}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
}
