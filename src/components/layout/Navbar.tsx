import { cn } from "@/lib/utils";

export function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <header
      className={cn(
        "fixed top-0 z-50 flex h-16 w-full items-center gap-4 border-b-px border-b-border bg-background/90 px-2 backdrop-blur-sm",
      )}
    >
      {children}
    </header>
  );
}
