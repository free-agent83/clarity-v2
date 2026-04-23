"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
} from "@nivoda/components";
import { useSearch } from "@/hooks/use-search";
import { SearchResultItem } from "@/components/shell/search-result-item";
import { IconLoader2 } from "@tabler/icons-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function SearchDialog({
  open,
  onOpenChange,
  initialQuery = "",
}: SearchDialogProps) {
  // initialQuery is set once when the dialog is opened; using it as the key
  // on this component (from SearchTrigger) resets state when it changes.
  const [query, setQuery] = useState(initialQuery);
  const { results, isLoading, totalCount } = useSearch(query);
  const router = useRouter();

  const hasQuery = query.length >= 2;
  const hasResults = totalCount > 0;

  function handleSelect(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  function handleViewAll() {
    onOpenChange(false);
    const q = query;
    setQuery("");
    router.push(`/buyer/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
      title="Search Minivoda"
      description="Search products, orders, invoices, and shortlists"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search products, orders, invoices..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Loading indicator */}
          {isLoading && hasQuery && (
            <div className="flex items-center justify-center py-6">
              <IconLoader2
                size={20}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}

          {/* No results */}
          {!isLoading && hasQuery && !hasResults && (
            <div className="py-6 text-center text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Empty state — dialog just opened */}
          {!hasQuery && !isLoading && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Start typing to search across all of Minivoda
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↑
                  </kbd>{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>{" "}
                  Open
                </span>
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    Esc
                  </kbd>{" "}
                  Close
                </span>
              </div>
            </div>
          )}

          {/* Product results */}
          {results.products.length > 0 && (
            <CommandGroup heading="Products">
              {results.products.map((item) => (
                <SearchResultItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={item.category}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </CommandGroup>
          )}

          {/* Order results */}
          {results.orders.length > 0 && (
            <CommandGroup heading="Orders">
              {results.orders.map((item) => (
                <SearchResultItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={item.category}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </CommandGroup>
          )}

          {/* Request results */}
          {results.requests.length > 0 && (
            <CommandGroup heading="Requests">
              {results.requests.map((item) => (
                <SearchResultItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={item.category}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </CommandGroup>
          )}

          {/* Invoice results (mocked) */}
          {results.invoices.length > 0 && (
            <CommandGroup heading="Invoices">
              {results.invoices.map((item) => (
                <SearchResultItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={item.category}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </CommandGroup>
          )}

          {/* Shortlist results (mocked) */}
          {results.shortlists.length > 0 && (
            <CommandGroup heading="Shortlists">
              {results.shortlists.map((item) => (
                <SearchResultItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={item.category}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer: "View all results" + count */}
        {hasQuery && hasResults && !isLoading && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <button
              onClick={handleViewAll}
              className="text-sm text-primary hover:underline"
            >
              View all results →
            </button>
            <span className="text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          </div>
        )}
      </Command>
    </CommandDialog>
  );
}
