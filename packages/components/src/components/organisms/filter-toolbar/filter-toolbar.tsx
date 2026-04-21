"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Separator } from "../../atoms/separator/separator";
import { Typography } from "../../atoms/typography/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../molecules/sheet/sheet";

export interface FilterToolbarSortOption {
  value: string;
  label: string;
}

/**
 * Drawer configuration passed to `FilterToolbar`. When provided, the
 * toolbar renders an "All filters" button plus an internally-managed
 * drawer. Omit to suppress both the button and the drawer.
 */
export interface FilterToolbarDrawer {
  /** Filter sections composed by the consumer (typically `FilterSection` wrappers). */
  content: ReactNode;
  /** Fires when the drawer transitions from closed to open. Consumer typically reseeds its draft from the applied state here. */
  onOpen?: () => void;
  /** Fires on the drawer's primary action. Consumer commits the draft; the drawer closes automatically. */
  onApply: () => void;
  /** Fires on the drawer's header Clear action. Only rendered when `hasActiveDraft` and `onClearDraft` are both provided. */
  onClearDraft?: () => void;
  /** Whether the current draft has any active filters. Gates the header Clear action. */
  hasActiveDraft?: boolean;
  /** Preview count for the primary action — renders as "Show X results". */
  resultsCount?: number;
  /** Primary action shows a loading state and is disabled while a preview-count fetch is in flight. */
  isCountLoading?: boolean;
  /** Primary action label when `resultsCount` is undefined. Default `"Apply"`. */
  applyLabel?: string;
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

  /**
   * All-filters drawer configuration. When provided, the toolbar renders
   * the "All filters" button (and its sticky-chrome counterpart) and
   * manages the drawer's open state internally. Omit to suppress both
   * the button and the drawer.
   */
  drawer?: FilterToolbarDrawer;
}

/**
 * Filter toolbar — search, All Filters button + drawer, inline filter
 * slot, sort, right-side actions slot, and an internal sticky chrome
 * that appears when the main toolbar scrolls out of view.
 *
 * The drawer is bundled into the toolbar because the All Filters button
 * never exists without one. Consumers pass drawer content and commit /
 * clear callbacks via the `drawer` prop; the toolbar owns the open
 * state and calls `drawer.onOpen` when the drawer transitions from
 * closed to open (typically the signal for the consumer to reseed its
 * draft from the applied filter state).
 *
 * The toolbar does not reason about filter shape or semantics. It flows
 * consumer-composed `filters` and `stickyFilters` into its chrome and
 * emits events through `onClearAll` and the search / sort / drawer
 * callbacks.
 */
export function FilterToolbar({
  filters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onClearAll,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  actions,
  stickyTopOffset = 72,
  disableSticky = false,
  drawer,
}: FilterToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  function handleDrawerOpenChange(next: boolean) {
    if (next && !drawerOpen) drawer?.onOpen?.();
    setDrawerOpen(next);
  }

  function handleApplyDraft() {
    drawer?.onApply();
    setDrawerOpen(false);
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
            {drawer && (
              <AllFiltersButton
                activeFilterCount={activeFilterCount}
                onClick={() => handleDrawerOpenChange(true)}
              />
            )}

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
        onOpenDrawer={
          drawer ? () => handleDrawerOpenChange(true) : undefined
        }
      />

      {drawer && (
        <Sheet open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
          <SheetContent
            side="left"
            className="flex w-full max-w-sm flex-col"
            aria-label="All filters"
          >
            <SheetHeader className="flex-row items-center justify-between pr-10">
              <SheetTitle>Filters</SheetTitle>
              {drawer.hasActiveDraft && drawer.onClearDraft && (
                <Button variant="link" size="sm" onClick={drawer.onClearDraft}>
                  Clear
                </Button>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {drawer.content}
            </div>

            <SheetFooter className="border-t px-6 py-4">
              <Button
                block
                onClick={handleApplyDraft}
                loading={drawer.isCountLoading}
                disabled={drawer.isCountLoading}
              >
                {drawer.resultsCount !== undefined
                  ? `Show ${new Intl.NumberFormat("en-US").format(drawer.resultsCount)} results`
                  : (drawer.applyLabel ?? "Apply")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

function AllFiltersButton({
  activeFilterCount,
  onClick,
}: {
  activeFilterCount: number;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" onClick={onClick} className="shrink-0">
      <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
      All filters
      {activeFilterCount > 0 && (
        <Typography asChild variant="caption">
          <span className="bg-accent text-accent-foreground px-1.5 rounded-full">
            {activeFilterCount}
          </span>
        </Typography>
      )}
    </Button>
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
  onOpenDrawer?: () => void;
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
            {onOpenDrawer && (
              <AllFiltersButton
                activeFilterCount={activeFilterCount}
                onClick={onOpenDrawer}
              />
            )}
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

export interface FilterSectionProps {
  label: string;
  children: ReactNode;
  /**
   * When false, suppresses the leading separator. Set `false` on the
   * first section of a drawer to avoid a redundant top rule.
   * Defaults to `true`.
   */
  separator?: boolean;
}

/**
 * Thin wrapper for a single filter entry inside the toolbar's drawer.
 * Renders an optional leading separator, a heading, and the filter
 * control. Lives in the FilterToolbar module because the drawer is
 * internal to the toolbar; consumers use this to compose
 * `FilterToolbar.drawer.content`.
 */
export function FilterSection({
  label,
  children,
  separator = true,
}: FilterSectionProps) {
  return (
    <div data-slot="filter-section">
      {separator && <Separator className="my-4" />}
      <div className="space-y-3">
        <Typography as="h3" variant="body-2" emphasis>
          {label}
        </Typography>
        {children}
      </div>
    </div>
  );
}
