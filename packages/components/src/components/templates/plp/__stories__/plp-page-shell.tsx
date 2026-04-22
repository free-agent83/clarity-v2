import type { ReactNode } from "react";
import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "../../../organisms/filter-toolbar/filter-toolbar";
import { PlpHeading } from "../plp-heading";
import type { BreadcrumbSegment } from "../plp-types";

const noop = () => {};

/**
 * Static PLP page layout used by the stories. Wires `PlpHeading`,
 * `FilterToolbar`, and a content slot into the canonical PLP structure
 * with no state — filter buttons, drawer, search, and sort are all
 * inert. Stories pick a different `content` (grid, list, empty state)
 * to illustrate each page-level state.
 */
export function PlpPageShell({
  breadcrumbs,
  title,
  resultsCount,
  banner,
  filters,
  drawerContent,
  searchPlaceholder,
  sortOptions,
  actions,
  children,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  banner?: ReactNode;
  filters?: ReactNode[];
  drawerContent: ReactNode;
  searchPlaceholder?: string;
  sortOptions: FilterToolbarSortOption[];
  actions?: ReactNode;
  children: ReactNode;
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
        filters={filters}
        activeFilterCount={0}
        hasActiveFilters={false}
        onClearAll={noop}
        onSearchSubmit={noop}
        searchPlaceholder={searchPlaceholder}
        sortOptions={sortOptions}
        sortValue={sortOptions[0]?.value}
        onSortChange={noop}
        actions={actions}
        drawer={{
          content: drawerContent,
          onApply: noop,
          hasActiveDraft: false,
        }}
      />
      {children}
    </main>
  );
}
