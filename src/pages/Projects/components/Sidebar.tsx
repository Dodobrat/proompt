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
        "sticky top-16 h-[calc(100vh_-_64px)] w-full max-w-sm overflow-hidden bg-card",
        className,
      )}
    >
      <div className="h-full overflow-auto">{children}</div>
    </Component>
  );
}
