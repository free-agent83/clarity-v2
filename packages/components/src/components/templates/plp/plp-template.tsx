"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Typography } from "../../atoms/typography/typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../molecules/breadcrumb/breadcrumb";
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
import { PlpStickyFilterBar } from "./toolbar/plp-sticky-filter-bar";
import { PlpToolbar } from "./toolbar/plp-toolbar";
import { Skeleton } from "../../atoms/skeleton/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../organisms/table/table";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import { useIsTabletUp } from "../../../hooks/use-is-tablet-up";
import type {
  BreadcrumbSegment,
  FilterDefinition,
  FilterState,
  FilterValue,
  PlpStatus,
  PlpViewMode,
  SortOption,
} from "./plp-types";

/**
 * Props for the PLP template.
 *
 * The template is a pure layout container. Both grid and list paths are
 * data-shape-agnostic — consumers compose cards / rows in-situ from the
 * PLP primitives and hand them to the template as ReactNodes. All
 * business logic (pricing variants, user-context decisions, row
 * click-through) lives in the consumer.
 */
export interface PlpTemplateProps {
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

  /**
   * Pre-rendered grid cards. Consumers compose cards from the
   * `PlpGridItem*` primitives and hand them in as an array of nodes.
   * Each element should carry its own `key`.
   */
  gridItems?: ReactNode[];

  /**
   * Pre-rendered header row for list view. A single `<PlpListHeaderRow>`
   * containing `<PlpListHeaderCell>` children. Must align with the cells
   * inside each `listRows` row; the template doesn't reconcile columns.
   */
  listHeader?: ReactNode;
  /**
   * Pre-rendered list rows. Consumers compose rows from `PlpListRow`,
   * `PlpListCell`, and the list content primitives. Each row should
   * carry its own `key`.
   */
  listRows?: ReactNode[];
  /**
   * List view availability. When true, the toolbar exposes the grid/list
   * toggle. At viewports < 1024px, the template silently falls back to
   * grid without calling `onViewModeChange`.
   */
  listViewAvailable?: boolean;
  /**
   * Current view mode. Defaults to "grid" when undefined.
   */
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;

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
export function PlpTemplate({
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
  gridItems,
  listHeader,
  listRows,
  listViewAvailable = false,
  viewMode = "grid",
  onViewModeChange,
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
}: PlpTemplateProps) {
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
  // - Grid if list view is not available (consumer opt-in)
  // - Grid if viewport is below tablet (silent fallback, consumer intent preserved)
  // - Otherwise, whatever the consumer asked for
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

      {/* Sticky filter bar — always mounted so it can animate in and out;
          `visible` is true only when the main toolbar is out of view and
          at least one filter is engaged. */}
      <PlpStickyFilterBar
        visible={showStickyFilterBar && hasEngagedFilters}
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Content area */}
      {status === "loading" &&
        (effectiveViewMode === "list" ? (
          <ListShell header={listHeader}>
            {Array.from({ length: pageSize }, (_, i) => (
              <ListSkeletonRow key={i} />
            ))}
          </ListShell>
        ) : (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
            data-slot="plp-grid"
            data-loading
          >
            {Array.from({ length: pageSize }, (_, i) => (
              <GridSkeletonCard key={i} />
            ))}
          </div>
        ))}

      {status === "success" &&
        (effectiveViewMode === "list" ? (
          <ListShell header={listHeader}>{listRows}</ListShell>
        ) : (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
            data-slot="plp-grid"
          >
            {gridItems}
          </div>
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
 * List table shell — owned by the template. Provides the scroll container,
 * sticky header positioning, and `<thead>`/`<tbody>` scaffolding. Consumer
 * provides the header row and the body rows as pre-rendered nodes.
 */
function ListShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      data-slot="plp-list"
    >
      <Table>
        {header && (
          <TableHeader className="sticky top-0 z-10 bg-background">
            {header}
          </TableHeader>
        )}
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

/**
 * Generic single-cell skeleton row used by the list's loading state. Spans
 * the full width regardless of the consumer's column count — the visual
 * transition into the real rows is brief and harmless.
 */
function ListSkeletonRow() {
  return (
    <TableRow>
      <TableCell colSpan={999} className="py-4">
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Single-slot skeleton card used by the grid's loading state. Matches the
 * default `PlpGridItem` proportions so a full page of skeletons reads
 * like the populated grid will.
 */
function GridSkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

/**
 * PLP heading area — breadcrumbs, category title, and results count.
 *
 * Breadcrumbs support arbitrary nesting. The last segment is rendered
 * as the current page (not a link). Results count announces via
 * `aria-live="polite"` when it changes.
 */
function PlpHeading({
  breadcrumbs,
  title,
  resultsCount,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
}) {
  const formattedCount = new Intl.NumberFormat("en-US").format(resultsCount);

  return (
    <div data-slot="plp-heading">
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={segment.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={segment.href || "#"}>
                        {segment.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <Typography as="h1" variant="h3" className="mt-2">
        {title}
      </Typography>

      <Typography
        variant="body-2"
        className="mt-1 text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {formattedCount} results
      </Typography>
    </div>
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
      <div className="flex items-center gap-2 text-muted-foreground">
        <Typography as="span" variant="body-2">Results per page</Typography>
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
            <Typography as="span" variant="body-2" className="px-2 text-muted-foreground">
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
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
