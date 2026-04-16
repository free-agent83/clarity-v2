"use client";

import { useState } from "react";
import { Button } from "../../atoms/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import { PlpHeading } from "./heading/plp-heading";
import { PlpToolbar } from "./toolbar/plp-toolbar";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpActiveFilters } from "./filters/plp-active-filters";
import { PlpGrid } from "./grid/plp-grid";
import { PlpGridItem } from "./grid/plp-grid-item";
import { PlpGridSkeleton } from "./grid/plp-grid-skeleton";
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import type {
  BreadcrumbSegment,
  FilterDefinition,
  FilterState,
  FilterValue,
  GridItemData,
  PlpStatus,
  SortOption,
} from "./plp-types";

/**
 * Props for the PLP template.
 */
export interface PlpTemplateProps<TItem> {
  // Heading
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;

  // Filters
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;

  // Sort
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;

  // Search
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;

  // Grid items
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;

  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // States
  status: PlpStatus;
  onRetry?: () => void;
  emptyFilterSuggestions?: string[];
  emptyMessage?: string;
}

/**
 * Product Listing Page template.
 *
 * A page-level component that orchestrates a complete product listing
 * experience: heading, toolbar with filtering and sorting, responsive
 * product grid, pagination, and loading/empty/error states.
 *
 * The template is stateless with respect to data fetching, routing, and
 * persistence. It receives state and emits change events. Consumers own
 * the data lifecycle.
 *
 * Must be rendered inside an AppShell.
 *
 * @see docs/plans/specs/2026-04-16-plp-template-phase1-design.md
 */
export function PlpTemplate<TItem>({
  breadcrumbs,
  title,
  resultsCount,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  items,
  renderGridItem,
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
  status,
  onRetry,
  emptyFilterSuggestions,
  emptyMessage,
}: PlpTemplateProps<TItem>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleClearAllFilters() {
    for (const filter of filters) {
      if (filterState[filter.id] !== undefined) {
        onFilterChange(filter.id, undefined);
      }
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <main className="space-y-4" data-slot="plp-template">
      {/* Heading */}
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />

      {/* Toolbar */}
      <PlpToolbar
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onOpenDrawer={() => setDrawerOpen(true)}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        searchPlaceholder={searchPlaceholder}
        onSearchSubmit={onSearchSubmit}
      />

      {/* Active filters strip */}
      <PlpActiveFilters
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onClearAll={handleClearAllFilters}
      />

      {/* Content area */}
      {status === "loading" && <PlpGridSkeleton count={pageSize} />}

      {status === "success" && (
        <PlpGrid>
          {items.map((item) => {
            const data = renderGridItem(item);
            return (
              <div key={data.id} role="listitem">
                <PlpGridItem data={data} />
              </div>
            );
          })}
        </PlpGrid>
      )}

      {(status === "empty-filtered" || status === "empty-no-items") && (
        <PlpEmpty
          variant={status}
          onClearFilters={
            status === "empty-filtered" ? handleClearAllFilters : undefined
          }
          filterSuggestions={emptyFilterSuggestions}
          message={emptyMessage}
        />
      )}

      {status === "error" && <PlpError onRetry={onRetry} />}

      {/* Pagination — only shown when there are items */}
      {status === "success" && totalItems > 0 && (
        <PlpPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* Filter drawer */}
      <PlpFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        filteredResultsCount={filteredResultsCount}
        onClearAll={handleClearAllFilters}
      />
    </main>
  );
}

/**
 * PLP pagination footer -- results per page selector + previous/next navigation.
 */
function PlpPagination({
  page,
  pageSize,
  totalPages,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <nav
      className="flex items-center justify-center gap-4 py-4"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Results per page</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger size="sm" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
