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
    key: "carat",
    label: "Carat",
    options: ["Under 1ct", "1–2ct", "2–5ct", "5–10ct", "10ct+"],
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
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "carat", label: "Carat" },
];

export function GemstonesFilters() {
  const toolbarProps = usePlpFilterController({
    filterDefs: FILTERS,
    sortOptions: SORT_OPTIONS,
  });

  return <FilterToolbar {...toolbarProps} onSearchSubmit={() => {}} />;
}
