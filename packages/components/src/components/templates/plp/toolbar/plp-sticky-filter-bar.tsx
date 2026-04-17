"use client";

import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { PlpQuickFilter } from "./plp-quick-filter";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Compact filter bar that appears fixed to the top of the viewport when
 * the main toolbar scrolls out of view.
 *
 * Renders the "All Filters" button and any *engaged* filters (quick or
 * non-quick) as a single-row horizontal list. Unlike the main toolbar
 * it does NOT wrap — the row scrolls horizontally when content
 * overflows. Gradient fades on both the left and right edges signify
 * the scrollability; the actual scrollbar is hidden.
 *
 * Sits below the AppShellHeader (`h-18` / 72px tall at `top-0`) at
 * `top-18` with `z-30` (below the header's `z-40` so it never overlaps).
 *
 * Sort, view toggle, search, pinned-but-empty quick filters, and the
 * "Clear all" action are intentionally absent — this bar's job is to
 * keep applied filters visible and editable while the user scrolls, not
 * to duplicate the full toolbar.
 */
export function PlpStickyFilterBar({
  filters,
  filterState,
  onFilterChange,
  onOpenDrawer,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onOpenDrawer: () => void;
}) {
  const engagedFilters = filters.filter(
    (f) => filterState[f.id] !== undefined
  );
  const activeFilterCount = engagedFilters.length;

  return (
    <div
      data-slot="plp-sticky-filter-bar"
      className="fixed inset-x-0 top-18 z-30 border-b border-border bg-background shadow-sm animate-in fade-in-0 slide-in-from-top-4 duration-200 ease-out"
    >
      <div className="mx-auto w-full max-w-384 px-6 py-3 group-data-[full=true]/app-shell:max-w-none">
        <div className="relative">
          {/* Horizontally-scrolling filter row — no visible scrollbar.
              Leading + trailing spacers keep the first/last items from
              being clipped by the edge gradients. */}
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-4 shrink-0" aria-hidden="true" />

            <Button
              variant="outline"
              onClick={onOpenDrawer}
              className="shrink-0"
            >
              <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
              All filters
              {activeFilterCount > 0 && (
                <Badge variant="default" size="sm" className="ml-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {engagedFilters.map((def) => (
              <PlpQuickFilter
                key={def.id}
                definition={def}
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            ))}

            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>

          {/* Left-side gradient overlay — signifies the row scrolls
              horizontally. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent"
          />

          {/* Right-side gradient overlay — same signifier on the
              opposite edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
