// ── AssemblyShell ─────────────────────────────────────────────────────
//
// Local helper that wires PlpHeading + FilterToolbar + content + optional
// pagination + FilterDrawer sibling into the canonical page layout.

import type { ReactNode } from "react";
import {
  FilterToolbar,
} from "../../../organisms/filter-toolbar/filter-toolbar";
import type {
  FilterToolbarDrawer,
  FilterToolbarSortOption,
} from "../../../organisms/filter-toolbar/filter-toolbar";
import { PlpHeading } from "../plp-heading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../../molecules/pagination/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import { Typography } from "../../../atoms/typography/typography";
import { Button } from "../../../atoms/button/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../../atoms/empty/empty";
import type { BreadcrumbSegment, PlpStatus } from "../plp-types";

// ── Shared props interface ────────────────────────────────────────────

export interface InteractiveShellProps {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  totalItems: number;
  sortOptions?: FilterToolbarSortOption[];
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  listHeader?: ReactNode;
  listRows?: ReactNode[];
  listViewAvailable?: boolean;
  gridItems?: ReactNode[];
  onRetry?: () => void;
  emptyMessage?: string;
  emptyFilterSuggestions?: string[];
  initialSortValue?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialViewMode?: import("../plp-types").PlpViewMode;
  baselineStatus?: PlpStatus;
  /** Optional node rendered under `PlpHeading`, above the toolbar. */
  banner?: ReactNode;
}

export function AssemblyShell({
  breadcrumbs,
  title,
  resultsCount,
  banner,
  toolbarFilters,
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
  drawer,
  children,
  pagination,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  banner?: ReactNode;
  toolbarFilters?: ReactNode[];
  stickyFilters?: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onSearchSubmit?: (q: string) => void;
  searchPlaceholder?: string;
  sortOptions?: FilterToolbarSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  actions?: ReactNode;
  drawer?: FilterToolbarDrawer;
  children: ReactNode;
  pagination?: ReactNode;
}) {
  return (
    <main className="space-y-4" data-slot="plp-assembly">
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />
      {banner}
      <FilterToolbar
        filters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onClearAll={onClearAll}
        onSearchSubmit={onSearchSubmit}
        searchPlaceholder={searchPlaceholder}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        actions={actions}
        drawer={drawer}
      />
      {children}
      {pagination}
    </main>
  );
}

// ── InlinePagination ──────────────────────────────────────────────────

export function InlinePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Typography as="span" variant="body-2">
          Results per page
        </Typography>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <Typography
              as="span"
              variant="body-2"
              className="px-2 text-muted-foreground"
            >
              Page {page} of {totalPages}
            </Typography>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ── Empty / error state suggestion ────────────────────────────────────
//
// The library doesn't ship PLP-specific empty/error components.
// Consumers compose the `Empty` atom with the copy and CTAs that fit
// their context. This helper is one example of what that looks like
// for a product-listing page — copy it into your app and adapt.

export function renderPlpEmptyState({
  status,
  onClearAll,
  onRetry,
  emptyMessage,
  emptyFilterSuggestions,
}: {
  status: "empty-filtered" | "empty-no-items" | "error";
  onClearAll?: () => void;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyFilterSuggestions?: string[];
}): ReactNode {
  if (status === "empty-filtered") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items match your filters</EmptyTitle>
          <EmptyDescription>
            Try adjusting your filters to find what you're looking for.
          </EmptyDescription>
          {emptyFilterSuggestions && emptyFilterSuggestions.length > 0 && (
            <EmptyDescription>
              Try removing:{" "}
              <Typography
                as="span"
                variant="body-2"
                emphasis
                className="text-foreground"
              >
                {emptyFilterSuggestions.join(", ")}
              </Typography>
            </EmptyDescription>
          )}
        </EmptyHeader>
        {onClearAll && (
          <EmptyContent>
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  if (status === "empty-no-items") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items available</EmptyTitle>
          <EmptyDescription>
            {emptyMessage || "There are no items in this category yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          We couldn't load the products. Please try again or contact support
          if the problem persists.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Button variant="outline" asChild>
          <a href="/support">Contact support</a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

// ── Toolbar + sticky slot routing ─────────────────────────────────────
//
// Given a buttons-by-id map, a pinned id list, and the currently active
// ids, produce the two slot arrays the FilterToolbar consumes:
// - `toolbarFilters`: pinned ids first (always), then engaged non-pinned
// - `stickyFilters`: only engaged ids (no empty pinned buttons)

export function routeFilterSlots(
  buttons: Record<string, ReactNode>,
  pinnedIds: readonly string[],
  activeIds: string[]
) {
  const pinnedSet = new Set(pinnedIds);
  const engagedNonPinned = activeIds.filter((id) => !pinnedSet.has(id));

  const toolbarFilters = [
    ...pinnedIds.map((id) => buttons[id]),
    ...engagedNonPinned.map((id) => buttons[id]),
  ].filter((n): n is ReactNode => !!n);

  const stickyFilters = activeIds
    .map((id) => buttons[id])
    .filter((n): n is ReactNode => !!n);

  return { toolbarFilters, stickyFilters };
}
