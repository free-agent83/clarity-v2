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
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import { useIsTabletUp } from "../../../hooks/use-is-tablet-up";
import type {
  BreadcrumbSegment,
  PlpStatus,
  PlpViewMode,
  SortOption,
} from "./plp-types";

/**
 * Props for the PLP template.
 *
 * The template is a stateless layout container. Filter content, grid
 * items, and list rows are all composed by the consumer and handed in
 * as `ReactNode` slots — the template does not reason about filter
 * shape, item data, or commit semantics. All business logic (filter
 * state, pricing variants, user-context decisions, preview-count
 * fetching, drawer assembly) lives in the consumer.
 */
export interface PlpTemplateProps {
  // Heading
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;

  // Filters (slots + signals only — see PlpFilterDrawer for drawer)
  /**
   * Pre-composed inline filter buttons for the toolbar row. Typically
   * pinned quick filters plus any engaged non-pinned filters. Each
   * element must carry its own `key`.
   */
  toolbarFilters?: ReactNode[];
  /**
   * Pre-composed inline filter buttons for the sticky bar. Typically a
   * subset of `toolbarFilters` — only engaged filters, no empty pinned
   * ones. Each element must carry its own `key`.
   */
  stickyFilters?: ReactNode[];
  /** Drives the "All filters" button badge in both the toolbar and sticky bar. */
  activeFilterCount: number;
  /**
   * Drives the "Clear all" button visibility in the toolbar and the
   * sticky bar's engagement gate (the bar only appears when the main
   * toolbar is off-screen AND at least one filter is engaged).
   */
  hasActiveFilters: boolean;
  /** Fired when the user clicks either "All filters" button. */
  onOpenDrawer: () => void;
  /**
   * Fired when the user clicks "Clear all" in the toolbar or the
   * "Clear all filters" button inside the empty-filtered state.
   */
  onClearAll: () => void;

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
  /** Current view mode. Defaults to "grid" when undefined. */
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
  emptyMessage?: string;
}

/**
 * Product Listing Page template.
 *
 * A page-level component that orchestrates a complete product listing
 * experience: heading, toolbar with filter slot + sort + view toggle,
 * responsive product grid or list, pagination, and loading/empty/error
 * states.
 *
 * The template is stateless with respect to filter schema, data
 * fetching, routing, and persistence. It renders what it's given.
 * Consumers own the filter drawer (rendered as a sibling via
 * `PlpFilterDrawer`), filter state + draft buffering, chip-summary
 * formatting, and all business logic.
 *
 * Must be rendered inside an AppShell.
 */
export function PlpTemplate({
  breadcrumbs,
  title,
  resultsCount,
  toolbarFilters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onOpenDrawer,
  onClearAll,
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
  emptyMessage,
}: PlpTemplateProps) {
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
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />

      <div ref={toolbarRef}>
        <PlpToolbar
          toolbarFilters={toolbarFilters}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          onOpenDrawer={onOpenDrawer}
          onClearAll={onClearAll}
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

      {/* Sticky bar — always mounted so it can animate in and out. Visible
          only when the main toolbar is off-screen AND at least one filter
          is engaged. */}
      <PlpStickyFilterBar
        visible={showStickyFilterBar && hasActiveFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={activeFilterCount}
        onOpenDrawer={onOpenDrawer}
      />

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
          onClearFilters={status === "empty-filtered" ? onClearAll : undefined}
          message={emptyMessage}
        />
      )}

      {status === "error" && <PlpError onRetry={onRetry} />}

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

function ListSkeletonRow() {
  return (
    <TableRow>
      <TableCell colSpan={999} className="py-4">
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  );
}

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
