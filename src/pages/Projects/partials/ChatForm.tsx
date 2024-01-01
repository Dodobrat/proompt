import { useFormContext, useFormState } from "react-hook-form";
import { SendHorizonal } from "lucide-react";
import { z } from "zod";

import { Form, FormInput } from "@/components/form";
import { Button } from "@/components/ui";

const chatSchema = z.object({
  prompt: z.string().min(2).max(250),
});

const defaultChatValues = {
  prompt: "",
};

export function ChatForm({ children }: { children?: React.ReactNode }) {
  const onSubmit = (data: z.infer<typeof chatSchema>) => {
    console.log(data);
  };

  return (
    <Form
      onSubmit={onSubmit}
      schema={chatSchema}
      defaultValues={defaultChatValues}
      className="grid min-h-full content-end gap-4"
    >
      {children}
      <ChatPrompt />
    </Form>
  );
}

function ChatPrompt() {
  const { control } = useFormContext();
  const { isDirty } = useFormState({ control });

  return (
    <div className="sticky bottom-0 grid items-start gap-2 pb-4 sm:grid-cols-[1fr_auto]">
      <FormInput.Textarea
        name="prompt"
        label=""
        placeholder="Your manual prompt here"
        hint="Type your manual prompt here or add filters and other nice things from the side"
        className="h-24 resize-none"
      />
      <div className="col-auto grid gap-2 py-1">
        <Button type="submit" size="icon" disabled={!isDirty}>
          <SendHorizonal />
        </Button>
        {/* <Button type="button" variant="outline" size="icon">
          <Filter />
        </Button> */}
      </div>
    </div>
  );
}
