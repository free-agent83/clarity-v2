"use client";

import { cn } from "@/lib/utils";
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
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
  SortOption,
} from "../plp-types";
import { useState } from "react";

/**
 * PLP toolbar -- search, All Filters button, quick filters, and sort.
 *
 * On mobile (< 640px): shows only All Filters + Sort.
 * On desktop: full toolbar with search, quick filters, and sort.
 */
export function PlpToolbar({
  filters,
  filterState,
  onFilterChange,
  onOpenDrawer,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onOpenDrawer: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const quickFilters = filters.filter((f) => f.isQuickFilter);
  const activeFilterCount = Object.keys(filterState).filter(
    (id) => filterState[id] !== undefined
  ).length;

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

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

      {/* Filter bar + sort */}
      <div className="flex items-center gap-2">
        {/* All Filters button */}
        <Button variant="outline" size="sm" onClick={onOpenDrawer} className="shrink-0">
          <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" />
            <line x1="17" x2="23" y1="16" y2="16" />
          </svg>
          All filters
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm" className="ml-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Quick filters -- hidden on mobile */}
        <div className="hidden items-center gap-2 sm:flex">
          {quickFilters.map((def) => (
            <PlpQuickFilter
              key={def.id}
              definition={def}
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="shrink-0">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger size="sm" className="w-auto min-w-[140px]">
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
