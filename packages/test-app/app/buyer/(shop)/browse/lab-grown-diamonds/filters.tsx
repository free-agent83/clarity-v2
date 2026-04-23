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
    key: "carat",
    label: "Carat",
    options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"],
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
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "carat", label: "Carat" },
];

export function LabGrownDiamondsFilters() {
  const toolbarProps = usePlpFilterController({
    filterDefs: FILTERS,
    sortOptions: SORT_OPTIONS,
  });

  return <FilterToolbar {...toolbarProps} onSearchSubmit={() => {}} />;
}
