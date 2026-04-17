"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../molecules/pagination/pagination";
import { PlpHeading } from "./heading/plp-heading";
import { PlpStickyFilterBar } from "./toolbar/plp-sticky-filter-bar";
import { PlpToolbar } from "./toolbar/plp-toolbar";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpGrid } from "./grid/plp-grid";
import { PlpGridItem } from "./grid/plp-grid-item";
import { PlpGridSkeleton } from "./grid/plp-grid-skeleton";
import { PlpList } from "./list/plp-list";
import { PlpListSkeleton } from "./list/plp-list-skeleton";
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import { useIsTabletUp } from "./hooks/use-is-tablet-up";
import type {
  BreadcrumbSegment,
  FilterDefinition,
  FilterState,
  FilterValue,
  GridItemData,
  ListColumn,
  PlpStatus,
  PlpViewMode,
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
  /**
   * When `true`, the drawer's "Show X results" button shows a loading
   * state (spinner, disabled). Consumers set this while a preview-count
   * request is in flight so the button reflects that the displayed
   * count is about to update.
   */
  isCountLoading?: boolean;
  /**
   * Fires whenever the draft filter state inside the All Filters drawer
   * changes, plus once on open with the initial state (= applied
   * `filterState`).
   *
   * Required: the drawer is designed around a live preview-count pattern.
   * Consumers use this to fetch a preview result count from their backend
   * and drive `filteredResultsCount` in real time while the user edits,
   * so the "Show X results" button reflects what the draft would yield.
   * Debouncing is the consumer's responsibility.
   *
   * If a consumer genuinely doesn't want a live preview count, pass a
   * no-op — but the expected pattern is to wire this to a debounced API
   * call and update `filteredResultsCount` accordingly.
   *
   * Not called on drawer close without apply — the applied state is
   * unchanged, so the consumer's existing count remains correct. On the
   * next open, this fires again with the applied state.
   */
  onDraftFilterStateChange: (draftState: FilterState) => void;

  // Sort
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;

  // Search
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;

  // Items
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;

  // List view (Phase 2) — optional
  /**
   * Category-configured columns for list view. Presence of a non-empty
   * array enables list view availability (the toggle appears and the
   * consumer can switch modes). Omit or pass empty to keep grid-only.
   */
  listColumns?: ListColumn<TItem>[];
  /**
   * Current view mode. Defaults to "grid" when undefined.
   * The template silently falls back to grid at viewports < 1024px,
   * without calling `onViewModeChange`.
   */
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;
  /**
   * Called when the user clicks a list view row.
   * List view only; no effect in grid view.
   */
  onItemClick?: (item: TItem) => void;

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
 * experience: heading, toolbar with filtering/sorting/view toggle,
 * responsive product grid or list, pagination, and loading/empty/error
 * states.
 *
 * The template is stateless with respect to data fetching, routing, and
 * persistence. It receives state and emits change events. Consumers own
 * the data lifecycle.
 *
 * Must be rendered inside an AppShell.
 *
 * @see docs/plans/specs/2026-04-16-plp-template-phase1-design.md
 * @see docs/plans/specs/2026-04-16-plp-template-phase2-design.md
 */
export function PlpTemplate<TItem>({
  breadcrumbs,
  title,
  resultsCount,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  isCountLoading,
  onDraftFilterStateChange,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  items,
  renderGridItem,
  listColumns,
  viewMode = "grid",
  onViewModeChange,
  onItemClick,
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
  const isTabletUp = useIsTabletUp();

  // Show a fixed filter bar once the main toolbar scrolls under the
  // AppShellHeader. We observe the toolbar's visibility with a viewport
  // top margin equal to the AppShellHeader's height (h-18 = 72px) so the
  // sticky bar appears right when the main toolbar disappears behind
  // the header.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showStickyFilterBar, setShowStickyFilterBar] = useState(false);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyFilterBar(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasEngagedFilters = Object.values(filterState).some(
    (v) => v !== undefined
  );

  function handleClearAllFilters() {
    for (const filter of filters) {
      if (filterState[filter.id] !== undefined) {
        onFilterChange(filter.id, undefined);
      }
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  // Resolve the effective view mode:
  // - Grid if list view is not available (no columns or empty)
  // - Grid if viewport is below tablet (silent fallback, consumer intent preserved)
  // - Otherwise, whatever the consumer asked for
  const listViewAvailable = !!listColumns && listColumns.length > 0;
  const effectiveViewMode: PlpViewMode =
    listViewAvailable && isTabletUp && viewMode === "list" ? "list" : "grid";

  const showViewToggle = listViewAvailable;

  return (
    <main className="space-y-4" data-slot="plp-template">
      {/* Heading */}
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />

      {/* Toolbar */}
      <div ref={toolbarRef}>
        <PlpToolbar
          filters={filters}
          filterState={filterState}
          onFilterChange={onFilterChange}
          onClearAll={handleClearAllFilters}
          onOpenDrawer={() => setDrawerOpen(true)}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={onSortChange}
          searchPlaceholder={searchPlaceholder}
          onSearchSubmit={onSearchSubmit}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          showViewToggle={showViewToggle}
        />
      </div>

      {/* Sticky filter bar — appears when the main toolbar is out of view
          and at least one filter is engaged. Hidden otherwise. */}
      {showStickyFilterBar && hasEngagedFilters && (
        <PlpStickyFilterBar
          filters={filters}
          filterState={filterState}
          onFilterChange={onFilterChange}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      )}

      {/* Content area */}
      {status === "loading" &&
        (effectiveViewMode === "list" && listColumns ? (
          <PlpListSkeleton listColumns={listColumns} count={pageSize} />
        ) : (
          <PlpGridSkeleton count={pageSize} />
        ))}

      {status === "success" &&
        (effectiveViewMode === "list" && listColumns ? (
          <PlpList
            items={items}
            renderGridItem={renderGridItem}
            listColumns={listColumns}
            onItemClick={onItemClick}
          />
        ) : (
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
        ))}

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

      {/* Pagination -- only shown when there are items */}
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
        isCountLoading={isCountLoading}
        onDraftFilterStateChange={onDraftFilterStateChange}
      />
    </main>
  );
}

/**
 * PLP pagination footer — results per page selector + previous/next navigation.
 *
 * Uses the design system Pagination molecule for Previous/Next and the
 * Select molecule for the page size dropdown.
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
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Results per page</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto">
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
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
