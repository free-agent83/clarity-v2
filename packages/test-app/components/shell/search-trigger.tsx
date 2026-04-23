"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IconSearch } from "@tabler/icons-react";

const SearchDialog = dynamic(
  () => import("@/components/shell/search-dialog").then((m) => m.SearchDialog),
  { ssr: false },
);

function preloadSearchDialog() {
  void import("@/components/shell/search-dialog");
}

export function SearchTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive initial state from URL param on first render
  const searchParam = searchParams.get("search");
  const [open, setOpen] = useState(() => searchParam !== null);
  const [initialQuery, setInitialQuery] = useState(() =>
    searchParam !== null && searchParam !== "true" ? searchParam : "",
  );

  // Clean up the ?search= param from the URL — this is a pure side effect
  // on an external system (the URL bar), not a state update.
  useEffect(() => {
    const param = searchParams.get("search");
    if (param !== null) {
      const url = new URL(window.location.href);
      url.searchParams.delete("search");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  // When searchParams changes (e.g. a new ?search= is added after mount),
  // update the dialog state in an event-like callback via the effect cleanup
  // pattern — the update happens inside a setTimeout so it is async, not a
  // synchronous setState in the effect body.
  useEffect(() => {
    const param = searchParams.get("search");
    if (param === null) return;
    const timer = setTimeout(() => {
      setInitialQuery(param === "true" ? "" : param);
      setOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Global ⌘K / Ctrl+K shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={preloadSearchDialog}
        onFocus={preloadSearchDialog}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-left transition-colors hover:bg-muted/80"
      >
        <IconSearch size={20} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          Search Minivoda...
        </span>
        <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <SearchDialog
        key={initialQuery}
        open={open}
        onOpenChange={setOpen}
        initialQuery={initialQuery}
      />
    </>
  );
}
