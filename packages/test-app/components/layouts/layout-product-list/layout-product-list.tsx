import * as React from "react";

import { LayoutBrowse } from "../layout-browse/layout-browse";
import { PaginationControls } from "../pagination-controls";
import type { BreadcrumbItem } from "../types";
import { SearchInput } from "@/components/filters/search-input";
import { UncontrolledSortButton } from "@/components/filters/uncontrolled-sort-button";
import type { SortOption } from "@/components/filters/sort-button";

export { type SortOption };
export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];
export const DEFAULT_PER_PAGE = 20;

type LayoutProductListProps = {
  breadcrumbs: BreadcrumbItem[];
  categoryName: string;
  categoryDescription?: string;
  resultCount?: number;
  quickFilters?: React.ReactNode;
  sortOptions?: SortOption[];
  currentPage: number;
  totalPages: number;
  perPage: number;
  children: React.ReactNode;
  className?: string;
};

export function LayoutProductList({
  breadcrumbs,
  categoryName,
  categoryDescription,
  resultCount,
  quickFilters,
  sortOptions,
  currentPage,
  totalPages,
  perPage,
  children,
  className,
}: LayoutProductListProps) {
  return (
    <LayoutBrowse breadcrumbs={breadcrumbs} className={className}>
      <div className="flex flex-col gap-8">
        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-medium leading-14 text-foreground">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="text-base text-muted-foreground">
              {categoryDescription}
            </p>
          )}
        </div>

        {/* Filtering area */}
        <div className="flex flex-col gap-4">
          {/* Result count */}
          {resultCount != null && (
            <p className="text-xl font-medium leading-8 tracking-[0.15px] text-muted-foreground">
              {resultCount.toLocaleString()} results
            </p>
          )}

          {/* Search bar */}
          <SearchInput placeholder="Search" full />

          {/* Filter bar — FilterBar renders All filters, popovers, and Clear all */}
          <div className="flex flex-wrap items-start gap-5">
            {quickFilters && (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {quickFilters}
              </div>
            )}

            {/* Right side: Sort by */}
            {sortOptions && sortOptions.length > 0 && (
              <UncontrolledSortButton options={sortOptions} />
            )}
          </div>
        </div>

        {/* Product grid — 4 columns */}
        <div className="grid grid-cols-4 gap-x-5 gap-y-16">{children}</div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          perPageOptions={PER_PAGE_OPTIONS}
        />
      </div>
    </LayoutBrowse>
  );
}
