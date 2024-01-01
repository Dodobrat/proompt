import { UseControllerReturn, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui";

export type FormError = { message: string };

export type FormContextInputHOC<T> = T & {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  id?: string;
  defaultValue?: string | unknown;
  controllerRenderProps?: (
    args: UseControllerReturn,
  ) => Record<string, unknown>;
  isClearable?: boolean;
  clearValue?: unknown;
  error?: FormError;
};

/**
 * withFormContext is a HOC that provides the useFormContext to the wrapped component.
 * It also provides the Controller component from react-hook-form.
 *
 * @example
 * const Input = withFormContext<TextFieldProps>(TextField);
 *
 * <Input name="name" label="Name" />
 *
 * @see https://react-hook-form.com/api/useformcontext
 */
export function withFormContext<ComponentPropTypes>(
  Component: React.ElementType,
  defaultInputValue?: unknown,
): React.FC<FormContextInputHOC<ComponentPropTypes>> {
  const normalizedDefaultValue =
    typeof defaultInputValue === "undefined" ? "" : defaultInputValue;

  return function WithFormContext({
    name,
    id = name,
    label,
    hint,
    defaultValue = normalizedDefaultValue,
    controllerRenderProps,
    isClearable,
    clearValue = "",
    ...rest
  }: FormContextInputHOC<ComponentPropTypes>) {
    const { control } = useFormContext();

    return (
      <FormField
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={(props) => {
          const getClearFieldMethod = () => {
            if (!isClearable) return {};
            if (!props.field.value) return {};
            if (
              Array.isArray(props.field.value) &&
              props.field.value.length === 0
            ) {
              return {};
            }
            return { onClear: () => props.field.onChange(clearValue) };
          };

          const inputProps = {
            ...props.field,
            id,
            error: props.fieldState.error,
            ...getClearFieldMethod(),
            ...rest,
            ...controllerRenderProps?.(props),
          };

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Component {...inputProps} />
              </FormControl>
              <FormDescription>{hint}</FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };
}
