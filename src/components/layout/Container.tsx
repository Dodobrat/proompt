import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-screen-lg mx-auto w-full px-2", className)}>
      {children}
    </div>
  );
}
