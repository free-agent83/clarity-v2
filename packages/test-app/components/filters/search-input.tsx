"use client";

import { useRef, useState } from "react";
import { Input } from "@nivoda/components";
import { IconSearch, IconX } from "@tabler/icons-react";

type SearchInputProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
  full?: boolean;
};

export function SearchInput({
  onSearch,
  placeholder = "Search...",
  full = false,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(value.trim());
  }

  function handleClear() {
    setValue("");
    onSearch?.("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${full ? "w-full" : "max-w-sm"}`}
    >
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 border-none bg-secondary pl-9 pr-9 shadow-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <IconX className="size-4" />
        </button>
      )}
    </form>
  );
}
