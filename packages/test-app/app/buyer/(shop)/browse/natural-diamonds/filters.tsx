"use client";

import * as React from "react";

import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import { MultiSelectFilterButton } from "@/components/filters/multi-select-filter-button";

const FILTERS = [
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

export function NaturalDiamondsFilters() {
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
