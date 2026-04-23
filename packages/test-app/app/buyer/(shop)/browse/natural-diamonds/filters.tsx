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
    options: [
      "Round",
      "Oval",
      "Princess",
      "Cushion",
      "Emerald",
      "Pear",
      "Radiant",
      "Marquise",
      "Heart",
      "Asscher",
    ],
  },
  {
    kind: "range",
    key: "carat",
    label: "Carat",
    axis: { id: "carat", min: 0, max: 10, step: 0.01, unit: "ct" },
  },
  {
    key: "color",
    label: "Color",
    options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  },
  {
    key: "clarity",
    label: "Clarity",
    options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"],
  },
  {
    key: "cut",
    label: "Cut",
    options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
  },
  {
    key: "certification",
    label: "Certification",
    options: ["GIA", "IGI", "HRD", "AGS", "None"],
  },
];

const SORT_OPTIONS: FilterToolbarSortOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "carat_asc", label: "Carat: Low → High" },
  { value: "carat_desc", label: "Carat: High → Low" },
];

export function NaturalDiamondsFilters() {
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
