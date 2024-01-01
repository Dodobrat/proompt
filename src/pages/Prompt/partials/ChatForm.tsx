import { Filter, SendHorizonal } from "lucide-react";
import * as z from "zod";

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
      className="grid gap-4 content-end min-h-full"
    >
      {children}
      <div className="grid sm:grid-cols-[1fr_auto] gap-2 pb-4 items-start">
        <FormInput.Textarea
          name="prompt"
          label=""
          placeholder="Your manual prompt here"
          hint="Type your manual prompt here or add filters and other nice things from the side"
          className="resize-none h-24"
        />
        <div className="col-auto grid py-2 gap-2">
          <Button type="submit">
            <span className="sm:hidden">Submit</span>
            <SendHorizonal className="ml-2" />
          </Button>
          <Button type="button" variant="outline">
            <Filter />
            <span className="sm:hidden">Filter</span>
          </Button>
        </div>
      </div>
    </Form>
  );
}
