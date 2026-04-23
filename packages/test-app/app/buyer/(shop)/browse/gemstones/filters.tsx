"use client";

import * as React from "react";

import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import { MultiSelectFilterButton } from "@/components/filters/multi-select-filter-button";

const FILTERS = [
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
  const [values, setValues] = React.useState<Record<string, string[]>>({});
  const [sortValue, setSortValue] = React.useState(SORT_OPTIONS[0].value);

  const activeFilterCount = Object.values(values).reduce(
    (n, v) => n + v.length,
    0,
  );
  const hasActiveFilters = activeFilterCount > 0;

  const filters = FILTERS.map((f) => (
    <MultiSelectFilterButton
      key={f.key}
      label={f.label}
      options={f.options}
      value={values[f.key] ?? []}
      onChange={(next) => setValues((prev) => ({ ...prev, [f.key]: next }))}
    />
  ));

  return (
    <FilterToolbar
      filters={filters}
      activeFilterCount={activeFilterCount}
      hasActiveFilters={hasActiveFilters}
      onClearAll={() => setValues({})}
      sortOptions={SORT_OPTIONS}
      sortValue={sortValue}
      onSortChange={setSortValue}
    />
  );
}
