import { cn } from "@/lib/utils";

export function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <header
      className={cn(
        "border-b-border border-b-px flex p-4 gap-4 sticky top-0 z-50 bg-background/90 backdrop-blur-sm",
      )}
    >
      {children}
    </header>
  );
}
