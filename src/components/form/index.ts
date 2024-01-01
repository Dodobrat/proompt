import { Textarea, TextareaProps } from "../ui";

import { withFormContext } from "./withFormContext";

export * from "./Form";

export const FormInput = Object.assign(
  {},
  {
    Textarea: withFormContext<TextareaProps>(Textarea),
  },
);
