import * as React from "react";

import {
  PlpHeading,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@nivoda/components";
import { SearchX } from "lucide-react";

import type { PlpViewMode } from "@/lib/plp-view-mode";
import type { BreadcrumbItem } from "../types";
import { PlpLoadingGrid } from "./plp-loading-grid";
import { PlpLoadingList } from "./plp-loading-list";
import { PlpLoadingProvider } from "./plp-loading-context";
import { PlpPagination } from "./plp-pagination";

export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];
export const DEFAULT_PER_PAGE = 20;

type LayoutPlpProps = {
  breadcrumbs: BreadcrumbItem[];
  categoryName: string;
  resultCount: number;
  /**
   * Pre-composed filter toolbar for this category. Typically a
   * colocated client component in `browse/{category}/filters.tsx` that
   * owns the filter state and renders the design-system `FilterToolbar`.
   * Rendered between the heading and the product grid.
   */
  toolbar?: React.ReactNode;
  /**
   * Promotional banner rendered between the heading and the toolbar.
   * Typically a narrow promo (e.g. Showroom).
   */
  banner?: React.ReactNode;
  currentPage: number;
  totalPages: number;
  /** Grid or list view. Defaults to grid. */
  viewMode?: PlpViewMode;
  /** Header row for the list view. Required when viewMode is "list". */
  listHeader?: React.ReactNode;
  children: React.ReactNode;
};

export function LayoutPlp({
  breadcrumbs,
  categoryName,
  resultCount,
  toolbar,
  banner,
  currentPage,
  totalPages,
  viewMode = "grid",
  listHeader,
  children,
}: LayoutPlpProps) {
  return (
    <PlpLoadingProvider>
      <div className="flex flex-col gap-8 pb-32">
        <PlpHeading
          breadcrumbs={breadcrumbs}
          title={categoryName}
          resultsCount={resultCount}
        />

        {banner}

        {toolbar}

        {resultCount === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No results found</EmptyTitle>
              <EmptyDescription>
                Try adjusting or clearing your filters to see more results.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {viewMode === "list" ? (
              <PlpLoadingList header={listHeader}>{children}</PlpLoadingList>
            ) : (
              <PlpLoadingGrid>{children}</PlpLoadingGrid>
            )}

            <PlpPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </PlpLoadingProvider>
  );
}
