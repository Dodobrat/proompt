import { Navbar, ThemeToggle } from "@/components";
import { ThemeProvider } from "@/context";

import { Prompt } from "./Prompt";

export default function App() {
  return (
    <ThemeProvider>
      <Navbar>
        <ThemeToggle />
      </Navbar>
      {/* TODO: Add auth */}
      <Prompt />
    </ThemeProvider>
  );
}
