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
    key: "type",
    label: "Type",
    options: [
      "Ruby",
      "Sapphire",
      "Emerald",
      "Tanzanite",
      "Aquamarine",
      "Amethyst",
      "Tourmaline",
      "Spinel",
    ],
  },
  {
    key: "shape",
    label: "Shape",
    options: [
      "Round",
      "Oval",
      "Cushion",
      "Pear",
      "Emerald",
      "Marquise",
      "Heart",
    ],
  },
  {
    key: "color",
    label: "Color",
    options: [
      "Red",
      "Blue",
      "Green",
      "Purple",
      "Pink",
      "Yellow",
      "Orange",
      "Teal",
    ],
  },
  {
    kind: "range",
    key: "carat",
    label: "Carat",
    axis: { id: "carat", min: 0, max: 20, step: 0.01, unit: "ct" },
  },
  {
    key: "origin",
    label: "Origin",
    options: [
      "Burma",
      "Ceylon",
      "Colombia",
      "Madagascar",
      "Mozambique",
      "Thailand",
      "Untreated",
    ],
  },
  {
    key: "treatment",
    label: "Treatment",
    options: ["None", "Heat", "Beryllium", "Fracture filled", "Oiling"],
  },
];

const SORT_OPTIONS: FilterToolbarSortOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "carat_asc", label: "Carat: Low → High" },
  { value: "carat_desc", label: "Carat: High → Low" },
];

export function GemstonesFilters() {
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
