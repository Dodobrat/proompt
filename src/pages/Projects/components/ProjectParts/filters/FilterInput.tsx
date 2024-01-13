import { useRef } from "react";
import { Search, X } from "lucide-react";

import { Button, Input } from "@/components/ui";

type FilterInputProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function FilterInput({ value, onValueChange }: FilterInputProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative px-2">
      <Search className="pointer-events-none absolute inset-y-0 left-4 h-full opacity-50" />
      <Input
        className="px-10"
        placeholder="Filter by name"
        value={value}
        onChange={({ target }) => onValueChange(target.value)}
        ref={searchRef}
      />
      {Boolean(value) && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => {
            onValueChange("");
            searchRef.current?.focus();
          }}
          className="absolute inset-y-0 right-2"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
