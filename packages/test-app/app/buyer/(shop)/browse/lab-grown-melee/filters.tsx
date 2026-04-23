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
    options: ["Round", "Princess", "Baguette", "Tapered baguette"],
  },
  {
    key: "size",
    label: "Size",
    options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"],
  },
  {
    key: "color_range",
    label: "Color range",
    options: ["DEF", "GHI", "JKL", "MNO"],
  },
  {
    key: "clarity_range",
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
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "carat", label: "Carat" },
];

export function LabGrownMeleeFilters() {
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
