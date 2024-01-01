import { ScrollArea } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Sidebar({
  children,
  className,
  as: Component = "nav",
}: {
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Component
      className={cn(
        "sticky top-16 h-[calc(100vh_-_64px)] w-full max-w-80 overflow-hidden bg-card",
        className,
      )}
    >
      <ScrollArea className="h-full">{children}</ScrollArea>
    </Component>
  );
}
