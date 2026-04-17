"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Input } from "../../../atoms/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import { PlpQuickFilter } from "./plp-quick-filter";
import { PlpViewToggle } from "./plp-view-toggle";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
  PlpViewMode,
  SortOption,
} from "../plp-types";

/**
 * PLP toolbar — search, All Filters button, inline filter buttons, view
 * toggle, and sort.
 *
 * **Filter model:** quick filters and engaged non-quick filters render as
 * a single row of buttons in the toolbar. Quick filters are "pinned" —
 * always present, showing either an active or empty state depending on
 * whether they have a value. Non-quick filters appear only when engaged
 * and disappear when cleared. Both share the same `PlpQuickFilter`
 * component; they look and behave identically (click to edit, Clear
 * inside the popover to dismiss).
 *
 * The filter row wraps to multiple lines when it overflows. The Sort
 * dropdown stays top-aligned on the right so it doesn't drift down the
 * column as filters wrap.
 *
 * "Clear all" appears at the end of the filter row whenever any filter
 * (quick or non-quick) has a value.
 *
 * On mobile (< 640px): only the All Filters button and Sort are shown;
 * the inline filter row is hidden. Users see engaged filter count via
 * the All Filters button's badge.
 */
export function PlpToolbar({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
  onOpenDrawer,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onClearAll: () => void;
  onOpenDrawer: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;
  showViewToggle?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const pinnedFilters = filters.filter((f) => f.isQuickFilter);
  const engagedNonQuickFilters = filters.filter(
    (f) => !f.isQuickFilter && filterState[f.id] !== undefined
  );
  const inlineFilters = [...pinnedFilters, ...engagedNonQuickFilters];
  const activeFilterCount = Object.keys(filterState).filter(
    (id) => filterState[id] !== undefined
  ).length;
  const hasActiveFilters = activeFilterCount > 0;

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

  const renderViewToggle =
    showViewToggle && viewMode !== undefined && !!onViewModeChange;

  return (
    <div className="space-y-3" data-slot="plp-toolbar">
      {/* Search -- hidden on mobile */}
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

      {/* Filter row (wraps) + view toggle + sort (top-aligned right) */}
      <div className="flex items-start gap-2">
        {/* Wrapping filter container */}
        <div className="flex flex-1 flex-wrap items-start gap-2">
          {/* All Filters button */}
          <Button variant="outline" onClick={onOpenDrawer} className="shrink-0">
            <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
            All filters
            {activeFilterCount > 0 && (
              <Badge variant="default" size="sm" className="ml-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Pinned quick filters + engaged non-quick filters -- hidden on mobile */}
          <div className="hidden flex-wrap items-start gap-2 sm:contents">
            {inlineFilters.map((def) => (
              <PlpQuickFilter
                key={def.id}
                definition={def}
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            ))}

            {/* Clear all — appears at the end whenever any filter is engaged */}
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

        {/* View toggle -- only at tablet+ when list view is available */}
        {renderViewToggle && (
          <div className={cn("hidden shrink-0 lg:flex")}>
            <PlpViewToggle value={viewMode!} onValueChange={onViewModeChange!} />
          </div>
        )}

        {/* Sort */}
        <div className="shrink-0">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-[140px]">
              <span className="mr-1 text-muted-foreground">Sort by</span>
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
      </div>
    </div>
  );
}
