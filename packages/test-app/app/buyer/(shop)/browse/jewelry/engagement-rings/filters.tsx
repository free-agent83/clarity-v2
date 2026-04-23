"use client";

import * as React from "react";

import {
  FilterToolbar,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import { MultiSelectFilterButton } from "@/components/filters/multi-select-filter-button";

const FILTERS = [
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
