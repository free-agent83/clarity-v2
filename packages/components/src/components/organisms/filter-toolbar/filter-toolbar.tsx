"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Typography } from "../../atoms/typography/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import { FilterDrawerTrigger } from "../../molecules/filter-drawer/filter-drawer";

export interface FilterToolbarSortOption {
  value: string;
  label: string;
}

export interface FilterToolbarProps {
  /** Pre-composed filter buttons for the main row. */
  filters?: ReactNode[];
  /**
   * Pre-composed filter buttons for the sticky chrome. Typically a subset
   * of `filters` — engaged filters only, no empty pinned ones. Consumer
   * decides membership.
   */
  stickyFilters?: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;

  // Optional search
  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;

  // Optional sort
  sortOptions?: FilterToolbarSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  /** Right-side extras (view toggle, custom controls). */
  actions?: ReactNode;

  /**
   * Offset (in px) from the top of the viewport at which the sticky
   * chrome appears. Defaults to 72 (the AppShellHeader height). Used
   * both as the IntersectionObserver's rootMargin and as the fixed
   * `top` value of the sticky chrome.
   */
  stickyTopOffset?: number;
  /** When true, disables sticky behaviour entirely. */
  disableSticky?: boolean;
}

/**
 * Filter toolbar — search, All Filters button, inline filter slot,
 * sort, right-side actions slot, and an internal sticky chrome that
 * appears when the main toolbar scrolls out of view.
 *
 * The toolbar does not reason about filter shape or semantics. It flows
 * consumer-composed `filters` and `stickyFilters` into its chrome and
 * emits events through `onOpenDrawer`, `onClearAll`, and the search /
 * sort callbacks. Sticky visibility is internal state driven by an
 * IntersectionObserver watching the main toolbar element.
 */
export function FilterToolbar({
  filters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onOpenDrawer,
  onClearAll,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  actions,
  stickyTopOffset = 72,
  disableSticky = false,
}: FilterToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (disableSticky) return;
    const el = mainRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      {
        rootMargin: `-${stickyTopOffset}px 0px 0px 0px`,
        threshold: 0,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [disableSticky, stickyTopOffset]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

  const stickyVisible = !disableSticky && scrolledPast && hasActiveFilters;
  const showSort = !!sortOptions && sortValue !== undefined && !!onSortChange;

  return (
    <>
      <div ref={mainRef} className="space-y-3" data-slot="filter-toolbar">
        {onSearchSubmit && (
          <div className="hidden sm:block">
            <Input
              placeholder={searchPlaceholder || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full"
            />
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-wrap items-start gap-2">
            <FilterDrawerTrigger
              activeFilterCount={activeFilterCount}
              onClick={onOpenDrawer}
            />

            <div className="hidden flex-wrap items-start gap-2 sm:contents">
              {filters}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={onClearAll}
                  className="shrink-0 text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {showSort && (
            <div className="shrink-0">
              <Select value={sortValue} onValueChange={onSortChange}>
                <SelectTrigger className="w-auto min-w-35">
                  <Typography
                    as="span"
                    variant="body-2"
                    className="mr-1 text-muted-foreground"
                  >
                    Sort by
                  </Typography>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>

      <StickyChrome
        visible={stickyVisible}
        stickyTopOffset={stickyTopOffset}
        activeFilterCount={activeFilterCount}
        stickyFilters={stickyFilters}
        onOpenDrawer={onOpenDrawer}
      />
    </>
  );
}

function StickyChrome({
  visible,
  stickyTopOffset,
  activeFilterCount,
  stickyFilters,
  onOpenDrawer,
}: {
  visible: boolean;
  stickyTopOffset: number;
  activeFilterCount: number;
  stickyFilters?: ReactNode[];
  onOpenDrawer: () => void;
}) {
  return (
    <div
      data-slot="filter-toolbar-sticky"
      data-state={visible ? "visible" : "hidden"}
      aria-hidden={!visible}
      style={{ top: stickyTopOffset }}
      className={cn(
        "fixed inset-x-0 z-30 border-b border-border bg-background shadow-sm",
        "transition-[opacity,transform] duration-200 ease-out",
        "data-[state=hidden]:pointer-events-none data-[state=hidden]:-translate-y-2 data-[state=hidden]:opacity-0"
      )}
    >
      <div className="mx-auto w-full max-w-384 px-6 py-3 group-data-[full=true]/app-shell:max-w-none">
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-4 shrink-0" aria-hidden="true" />
            <FilterDrawerTrigger
              activeFilterCount={activeFilterCount}
              onClick={onOpenDrawer}
            />
            {stickyFilters}
            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
