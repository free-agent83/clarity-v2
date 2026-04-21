"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import { Input } from "../../../atoms/input/input";
import { Typography } from "../../../atoms/typography/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import { PlpAllFiltersButton } from "./plp-all-filters-button";
import { PlpViewToggle } from "./plp-view-toggle";
import type { PlpViewMode, SortOption } from "../plp-types";

export interface PlpToolbarProps {
  /**
   * Pre-composed inline filter buttons. Consumers assemble these from
   * `PlpQuickFilter` (or any other node) and decide which filters
   * belong in the toolbar row. Each element must carry its own `key`.
   */
  toolbarFilters?: ReactNode[];
  /** Drives the "All filters" button badge. */
  activeFilterCount: number;
  /** Drives the visibility of the "Clear all" action. */
  hasActiveFilters: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;
  showViewToggle?: boolean;
}

/**
 * PLP toolbar — search, All Filters button, inline filter slot, view
 * toggle, and sort.
 *
 * **Filter model:** the toolbar does not reason about the filters
 * themselves. It flows a pre-composed `toolbarFilters` node list into
 * a wrapping row after the All Filters button and appends "Clear all"
 * when the consumer signals `hasActiveFilters`. Consumers decide what
 * belongs in the row (pinned quick filters, engaged non-quick filters,
 * or anything else) and how each filter button is composed.
 *
 * The filter row wraps to multiple lines when it overflows. Sort stays
 * top-aligned on the right so it doesn't drift down the column as
 * filters wrap.
 *
 * On mobile (< 640px): only the All Filters button and Sort are shown;
 * the inline filter row is hidden. Users see engaged filter count via
 * the All Filters button's badge.
 */
export function PlpToolbar({
  toolbarFilters,
  activeFilterCount,
  hasActiveFilters,
  onOpenDrawer,
  onClearAll,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
}: PlpToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
        <div className="flex flex-1 flex-wrap items-start gap-2">
          <PlpAllFiltersButton
            activeFilterCount={activeFilterCount}
            onClick={onOpenDrawer}
          />

          {/* Inline filter slot + Clear all -- hidden on mobile */}
          <div className="hidden flex-wrap items-start gap-2 sm:contents">
            {toolbarFilters}

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

        {/* Sort */}
        <div className="shrink-0">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-35">
              <Typography as="span" variant="body-2" className="mr-1 text-muted-foreground">
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

        {/* View toggle -- only at tablet+ when list view is available. */}
        {renderViewToggle && (
          <div className={cn("hidden shrink-0 lg:flex")}>
            <PlpViewToggle value={viewMode!} onValueChange={onViewModeChange!} />
          </div>
        )}
      </div>
    </div>
  );
}
