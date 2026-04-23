import * as React from "react";

import { PlpGridContainer, PlpHeading } from "@nivoda/components";

import { PaginationControls } from "../pagination-controls";
import type { BreadcrumbItem } from "../types";
import { SearchInput } from "@/components/filters/search-input";
import { UncontrolledSortButton } from "@/components/filters/uncontrolled-sort-button";
import type { SortOption } from "@/components/filters/sort-button";

export { type SortOption };
export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];
export const DEFAULT_PER_PAGE = 20;

type LayoutPlpProps = {
  breadcrumbs: BreadcrumbItem[];
  categoryName: string;
  resultCount: number;
  quickFilters?: React.ReactNode;
  sortOptions?: SortOption[];
  currentPage: number;
  totalPages: number;
  perPage: number;
  children: React.ReactNode;
};

export function LayoutPlp({
  breadcrumbs,
  categoryName,
  resultCount,
  quickFilters,
  sortOptions,
  currentPage,
  totalPages,
  perPage,
  children,
}: LayoutPlpProps) {
  return (
    <div className="flex flex-col gap-8 pb-32">
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={categoryName}
        resultsCount={resultCount}
      />

      <div className="flex flex-col gap-4">
        <SearchInput placeholder="Search" full />
        <div className="flex flex-wrap items-start gap-5">
          {quickFilters ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {quickFilters}
            </div>
          ) : null}
          {sortOptions && sortOptions.length > 0 ? (
            <UncontrolledSortButton options={sortOptions} />
          ) : null}
        </div>
      </div>

      <PlpGridContainer>{children}</PlpGridContainer>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        perPageOptions={PER_PAGE_OPTIONS}
      />
    </div>
  );
}
