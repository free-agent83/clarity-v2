"use client";

import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import {
  usePlpFilterController,
  type FilterDef,
} from "@/hooks/use-plp-filter-controller";

const FILTERS: FilterDef[] = [
  {
    key: "stone_shape",
    label: "Stone shape",
    options: [
      "Round",
      "Oval",
      "Princess",
      "Cushion",
      "Emerald",
      "Pear",
      "Radiant",
      "Marquise",
    ],
  },
  {
    key: "stone_count",
    label: "Stone count",
    options: ["Solitaire", "3-stone", "Halo", "Pavé", "Channel"],
  },
  {
    key: "metal",
    label: "Metal",
    options: [
      "14k Yellow Gold",
      "18k Yellow Gold",
      "14k Rose Gold",
      "18k Rose Gold",
      "14k White Gold",
      "18k White Gold",
      "950 Platinum",
    ],
  },
  {
    key: "style",
    label: "Style",
    options: ["Classic", "Vintage", "Modern", "Nature-inspired", "Bezel"],
  },
];

const SORT_OPTIONS: FilterToolbarSortOption[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

export function EngagementRingsFilters() {
  const toolbarProps = usePlpFilterController({
    filterDefs: FILTERS,
    sortOptions: SORT_OPTIONS,
  });

  return <FilterToolbar {...toolbarProps} onSearchSubmit={() => {}} />;
}
