import type { ReactNode } from "react";

// -- Filter system ----------------------------------------------------------

/** A single option within a chip-based or dropdown filter. */
export interface FilterOption {
  value: string;
  label: string;
  /** Small visual before the label (color swatch, flag icon). */
  adornment?: ReactNode;
  /**
   * Overrides the default toggle button content entirely.
   * Receives selection state so the consumer can style accordingly.
   * The preset still owns the outer button shell (click, aria, selection border).
   * Use for rich option layouts (e.g., icon on top + label below, card-shaped).
   */
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

/** Props every filter control receives -- preset or custom. */
export interface FilterControlProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  options?: FilterOption[];
}

/** Union of all possible filter value shapes. */
export type FilterValue =
  | string
  | string[]
  | { min: number; max: number }
  | boolean
  | undefined;

/** Map of filter ID to its current value. */
export type FilterState = Record<string, FilterValue>;

/** Names of built-in filter presets. */
export type FilterPresetName =
  | "boolean-chip"
  | "single-select-chips"
  | "multi-select-chips"
  | "single-select-dropdown";

/** A filter definition that references a built-in preset. */
export interface PresetFilterDefinition {
  id: string;
  label: string;
  preset: FilterPresetName;
  isQuickFilter?: boolean;
  popoverWidth?: number | string;
  options?: FilterOption[];
  /** Display label for boolean-chip preset (e.g. "Only Nivoda Curated items"). */
  chipLabel?: string;
}

/** A filter definition that supplies its own render function. */
export interface CustomFilterDefinition {
  id: string;
  label: string;
  preset: "custom";
  isQuickFilter?: boolean;
  popoverWidth?: number | string;
  /** Custom render function -- receives value + onChange, returns the control UI. */
  renderControl: (props: FilterControlProps) => ReactNode;
  /** Formats the current value for display in active filter chips. */
  formatChipValue?: (value: FilterValue) => string;
}

/** A filter definition -- either a preset reference or a custom render prop. */
export type FilterDefinition = PresetFilterDefinition | CustomFilterDefinition;

// -- Grid item model --------------------------------------------------------

/** Pricing data for a grid item. Template handles all variant rendering. */
export interface PricingData {
  amount: number;
  currency: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  legacyDeliveredPrice?: { amount: number; currency: string };
  includeTariffs?: boolean;
}

/** A category-specific thumbnail action. */
export interface CategoryThumbnailAction {
  id: string;
  icon: ReactNode;
  /** Tooltip text and accessible name. */
  label: string;
  onAction: (itemId: string) => void;
}

/** The structured data object returned by the `renderGridItem` mapper. */
export interface GridItemData {
  id: string;
  name: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  /** Category-owned slot -- can contain text, links, mixed content. */
  lead?: ReactNode;
  /** Category-supplied badge nodes. Template renders with consistent spacing. */
  badges?: ReactNode[];
  /** Optional category-owned slot between badges and delivery. */
  categorySlotTop?: ReactNode;
  /** Optional category-owned slot below pricing. */
  categorySlotBottom?: ReactNode;
  delivery: {
    estimatedDate: string;
    shipsFrom: string;
    isExpress?: boolean;
  };
  returns: {
    isReturnable: boolean;
  };
  pricing: PricingData;
  onAddToCart: () => void;
  /** When true, selection checkbox appears in the thumbnail toolbar. */
  enableSelection?: boolean;
  /** Category-specific actions appended after platform actions. */
  categoryActions?: CategoryThumbnailAction[];
  /** Platform action callbacks. */
  onFavorite?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  onViewMedia?: (itemId: string) => void;
}

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

// -- User context (for Storybook/testing) -----------------------------------

/** User context shape consumed by the template for variant rendering. */
export interface PlpUserContextValue {
  currency: string;
  location: string;
  pricingModel: "standard" | "legacy";
  featureFlags?: Record<string, boolean>;
}

// -- Template status --------------------------------------------------------

/** The current state of the PLP content area. */
export type PlpStatus =
  | "loading"
  | "success"
  | "empty-filtered"
  | "empty-no-items"
  | "error";

// -- List view --------------------------------------------------------------

/**
 * A category-configured column for list view.
 *
 * The `cell` function receives the raw item (not `GridItemData`) so the
 * category has full access to original item data — including fields that
 * don't live on `GridItemData` (e.g., certificate number, carat, clarity).
 */
export interface ListColumn<TItem> {
  id: string;
  header: string;
  cell: (item: TItem) => ReactNode;
  /** Optional fixed width (CSS value or number of pixels). */
  width?: number | string;
  /** Text alignment for cell and header. Defaults to "left". */
  align?: "left" | "center" | "right";
}

/** View mode — grid or list. */
export type PlpViewMode = "grid" | "list";
