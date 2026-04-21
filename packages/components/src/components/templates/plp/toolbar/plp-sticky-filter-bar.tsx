"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PlpAllFiltersButton } from "./plp-all-filters-button";

export interface PlpStickyFilterBarProps {
  /**
   * Whether the sticky bar is visible. The component stays mounted when
   * `false` so it can animate out via CSS transitions on `opacity` and
   * `transform`.
   */
  visible: boolean;
  /**
   * Pre-composed inline filter buttons. Typically a subset of the
   * toolbar's filters — the engaged ones only. Consumers decide the
   * membership; the sticky bar does not classify.
   */
  stickyFilters?: ReactNode[];
  /** Drives the "All filters" button badge. */
  activeFilterCount: number;
  onOpenDrawer: () => void;
}

/**
 * Compact filter bar pinned to the top of the viewport when the main
 * toolbar scrolls out of view.
 *
 * Renders the "All Filters" button plus the consumer-supplied
 * `stickyFilters` slot as a single horizontal row. The row does not
 * wrap; overflow scrolls horizontally, with gradient fades on both
 * edges signifying scrollability (the actual scrollbar is hidden).
 *
 * Sits below the AppShellHeader at `top-18` / `z-30` (below the
 * header's `z-40` so it never overlaps).
 *
 * Sort, view toggle, search, and "Clear all" are intentionally absent
 * — this bar's job is to keep applied filters visible and editable
 * while the user scrolls, not to duplicate the full toolbar.
 */
export function PlpStickyFilterBar({
  visible,
  stickyFilters,
  activeFilterCount,
  onOpenDrawer,
}: PlpStickyFilterBarProps) {
  return (
    <div
      data-slot="plp-sticky-filter-bar"
      data-state={visible ? "visible" : "hidden"}
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-18 z-30 border-b border-border bg-background shadow-sm",
        "transition-[opacity,transform] duration-200 ease-out",
        "data-[state=hidden]:pointer-events-none data-[state=hidden]:-translate-y-2 data-[state=hidden]:opacity-0"
      )}
    >
      <div className="mx-auto w-full max-w-384 px-6 py-3 group-data-[full=true]/app-shell:max-w-none">
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-4 shrink-0" aria-hidden="true" />

            <PlpAllFiltersButton
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
