// -- Sort -------------------------------------------------------------------

/** A single sort option for the sort dropdown. */
export interface SortOption {
  value: string;
  label: string;
}

// -- Breadcrumbs ------------------------------------------------------------

/** A breadcrumb segment. */
export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

// -- Template status --------------------------------------------------------

/** The current state of the PLP content area. */
export type PlpStatus =
  | "loading"
  | "success"
  | "empty-filtered"
  | "empty-no-items"
  | "error";

/** View mode — grid or list. */
export type PlpViewMode = "grid" | "list";
