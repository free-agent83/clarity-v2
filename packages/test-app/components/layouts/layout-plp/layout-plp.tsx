import * as React from "react";

import { PlpGridContainer, PlpHeading } from "@nivoda/components";

import { PaginationControls } from "../pagination-controls";
import type { BreadcrumbItem } from "../types";

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
  currentPage: number;
  totalPages: number;
  perPage: number;
  children: React.ReactNode;
};

export function LayoutPlp({
  breadcrumbs,
  categoryName,
  resultCount,
  toolbar,
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

      {toolbar}

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
