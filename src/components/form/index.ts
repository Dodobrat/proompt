import { Input, InputProps, Textarea, TextareaProps } from "../ui";

import { withFormContext } from "./withFormContext";

export * from "./Form";

export const FormInput = Object.assign(withFormContext<InputProps>(Input), {
  Textarea: withFormContext<TextareaProps>(Textarea),
});
