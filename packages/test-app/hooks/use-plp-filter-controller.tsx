"use client";

import * as React from "react";
import type { ReactNode } from "react";

import {
  Checkbox,
  FilterSection,
  type FilterToolbarProps,
  type FilterToolbarSortOption,
} from "@nivoda/components";

import { MultiSelectFilterButton } from "@/components/filters/multi-select-filter-button";

export type FilterDef = {
  key: string;
  label: string;
  options: string[];
};

type PlpFilterControllerArgs = {
  filterDefs: FilterDef[];
  sortOptions: FilterToolbarSortOption[];
};

/**
 * Everything a PLP `FilterToolbar` render needs except the
 * consumer-owned pieces (search, category-specific actions).
 *
 * The main filter row commits each filter independently via the
 * `MultiSelectFilterButton` render-prop popover (Apply / Clear).
 * The drawer edits a draft of the full filter set — seeded from the
 * applied state on open and copied back on Apply.
 */
type PlpFilterControllerResult = Pick<
  FilterToolbarProps,
  | "filters"
  | "activeFilterCount"
  | "hasActiveFilters"
  | "onClearAll"
  | "sortOptions"
  | "sortValue"
  | "onSortChange"
  | "drawer"
>;

export function usePlpFilterController({
  filterDefs,
  sortOptions,
}: PlpFilterControllerArgs): PlpFilterControllerResult {
  const [values, setValues] = React.useState<Record<string, string[]>>({});
  const [draft, setDraft] = React.useState<Record<string, string[]>>({});
  const [sortValue, setSortValue] = React.useState(sortOptions[0].value);

  const activeFilterCount = Object.values(values).reduce(
    (n, v) => n + v.length,
    0,
  );
  const hasActiveFilters = activeFilterCount > 0;
  const hasActiveDraft = Object.values(draft).some((v) => v.length > 0);

  const filters = filterDefs.map((f) => (
    <MultiSelectFilterButton
      key={f.key}
      label={f.label}
      options={f.options}
      value={values[f.key] ?? []}
      onChange={(next) => setValues((prev) => ({ ...prev, [f.key]: next }))}
    />
  ));

  function toggleDraft(key: string, option: string) {
    setDraft((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [key]: next };
    });
  }

  const drawerContent: ReactNode = filterDefs.map((f, i) => {
    const selected = draft[f.key] ?? [];
    return (
      <FilterSection key={f.key} label={f.label} separator={i > 0}>
        <div className="flex flex-col gap-2">
          {f.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => toggleDraft(f.key, option)}
              />
              {option}
            </label>
          ))}
        </div>
      </FilterSection>
    );
  });

  return {
    filters,
    activeFilterCount,
    hasActiveFilters,
    onClearAll: () => setValues({}),
    sortOptions,
    sortValue,
    onSortChange: setSortValue,
    drawer: {
      content: drawerContent,
      onOpen: () => setDraft(values),
      onApply: () => setValues(draft),
      onClearDraft: () => setDraft({}),
      hasActiveDraft,
    },
  };
}
