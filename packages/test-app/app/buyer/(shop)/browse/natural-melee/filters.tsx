"use client";

import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import {
  usePlpFilterController,
  type FilterDef,
} from "@/hooks/use-plp-filter-controller";
import { PlpViewModeToggle } from "@/components/products/plp-view-mode-toggle";

const FILTERS: FilterDef[] = [
  {
    key: "shape",
    label: "Shape",
    options: ["Round", "Princess", "Baguette", "Tapered baguette"],
  },
  {
    key: "sizeRange",
    label: "Size",
    options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"],
  },
  {
    key: "colorRange",
    label: "Color range",
    options: ["DEF", "GHI", "JKL", "MNO"],
  },
  {
    key: "clarityRange",
    label: "Clarity range",
    options: ["VVS", "VS", "SI", "I"],
  },
  {
    key: "cut",
    label: "Cut",
    options: ["Excellent", "Very Good", "Good"],
  },
];

const SORT_OPTIONS: FilterToolbarSortOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export function NaturalMeleeFilters() {
  const toolbarProps = usePlpFilterController({
    filterDefs: FILTERS,
    sortOptions: SORT_OPTIONS,
    defaultSort: "newest",
  });

  return (
    <FilterToolbar
      {...toolbarProps}
      onSearchSubmit={() => {}}
      actions={<PlpViewModeToggle />}
    />
  );
}
