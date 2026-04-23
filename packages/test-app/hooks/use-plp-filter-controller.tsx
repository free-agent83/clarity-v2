"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Checkbox,
  FilterSection,
  RangeFilter,
  type FilterToolbarProps,
  type FilterToolbarSortOption,
  type RangeAxis,
} from "@nivoda/components";

import { MultiSelectFilterButton } from "@/components/filters/multi-select-filter-button";
import { RangeFilterButton } from "@/components/filters/range-filter-button";
import { usePlpLoading } from "@/components/layouts/layout-plp/plp-loading-context";

// ---------------------------------------------------------------------------
// FilterDef — the per-category config each controller passes in
// ---------------------------------------------------------------------------

type MultiFilterDef = {
  kind?: "multi";
  key: string;
  label: string;
  options: string[];
};

type RangeFilterDef = {
  kind: "range";
  key: string;
  label: string;
  axis: RangeAxis;
};

export type FilterDef = MultiFilterDef | RangeFilterDef;

type RangeValue = { min: number; max: number };
type FilterValue = string[] | RangeValue | undefined;

type PlpFilterControllerArgs = {
  filterDefs: FilterDef[];
  sortOptions: FilterToolbarSortOption[];
  /**
   * Sort value used when no `?sort=` is present in the URL. Also the
   * "omit from URL" threshold — commits that land on this value strip
   * the `sort` param rather than echoing the default. Defaults to the
   * first sort option.
   */
  defaultSort?: string;
};

type PlpFilterControllerResult = Pick<
  FilterToolbarProps,
  | "filters"
  | "stickyFilters"
  | "activeFilterCount"
  | "hasActiveFilters"
  | "onClearAll"
  | "sortOptions"
  | "sortValue"
  | "onSortChange"
  | "drawer"
>;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Owns everything a PLP `FilterToolbar` needs except the
 * consumer-specific pieces (search, category-specific actions).
 *
 * Applied state is sourced from the URL (`useSearchParams`); any commit
 * (main-row Apply, drawer Apply, clear-all, sort change) pushes a new
 * URL via `router.push` and resets `page=1`. The drawer's draft is the
 * only piece of client-owned state — seeded from applied values on open,
 * and pushed to the URL on Apply.
 */
export function usePlpFilterController({
  filterDefs,
  sortOptions,
  defaultSort,
}: PlpFilterControllerArgs): PlpFilterControllerResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTransition } = usePlpLoading();

  const resolvedDefaultSort = defaultSort ?? sortOptions[0].value;

  // --- Derive applied values from URL ------------------------------------
  const values = React.useMemo(() => {
    const v: Record<string, FilterValue> = {};
    for (const def of filterDefs) {
      if (def.kind === "range") {
        const min = searchParams.get(`${def.key}_min`);
        const max = searchParams.get(`${def.key}_max`);
        if (min || max) {
          v[def.key] = {
            min: min ? Number(min) : def.axis.min,
            max: max ? Number(max) : def.axis.max,
          };
        }
      } else {
        const raw = searchParams.get(def.key);
        if (raw) {
          const picks = raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (picks.length > 0) v[def.key] = picks;
        }
      }
    }
    return v;
  }, [searchParams, filterDefs]);

  const sortValue = searchParams.get("sort") ?? resolvedDefaultSort;

  // --- Drawer draft ------------------------------------------------------
  const [draft, setDraft] = React.useState<Record<string, FilterValue>>({});

  // --- Counts + booleans -------------------------------------------------
  // Counts engaged filter *types* (each def with any active value counts
  // once), not the total number of options selected across them.
  const activeFilterCount = React.useMemo(() => {
    let n = 0;
    for (const def of filterDefs) {
      const v = values[def.key];
      if (!v) continue;
      if (def.kind === "range") {
        n += 1;
      } else if (Array.isArray(v) && v.length > 0) {
        n += 1;
      }
    }
    return n;
  }, [values, filterDefs]);

  const hasActiveFilters = activeFilterCount > 0;

  const hasActiveDraft = React.useMemo(() => {
    for (const def of filterDefs) {
      const v = draft[def.key];
      if (!v) continue;
      if (def.kind === "range") return true;
      if (Array.isArray(v) && v.length > 0) return true;
    }
    return false;
  }, [draft, filterDefs]);

  // --- URL push ----------------------------------------------------------
  const pushUrl = React.useCallback(
    (nextValues: Record<string, FilterValue>, nextSort: string) => {
      const params = new URLSearchParams();

      for (const def of filterDefs) {
        const val = nextValues[def.key];
        if (!val) continue;
        if (def.kind === "range") {
          if (typeof val !== "object" || Array.isArray(val)) continue;
          if (val.min !== def.axis.min) {
            params.set(`${def.key}_min`, String(val.min));
          }
          if (val.max !== def.axis.max) {
            params.set(`${def.key}_max`, String(val.max));
          }
        } else if (Array.isArray(val) && val.length > 0) {
          params.set(def.key, val.join(","));
        }
      }

      if (nextSort !== resolvedDefaultSort) {
        params.set("sort", nextSort);
      }

      // Preserve perPage, drop page (always reset to 1 on filter/sort change)
      const perPage = searchParams.get("perPage");
      if (perPage) params.set("perPage", perPage);

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [filterDefs, resolvedDefaultSort, pathname, router, searchParams, startTransition],
  );

  // --- Commit handlers ---------------------------------------------------
  const commitFilter = React.useCallback(
    (key: string, nextValue: FilterValue) => {
      pushUrl({ ...values, [key]: nextValue }, sortValue);
    },
    [pushUrl, values, sortValue],
  );

  const onClearAll = React.useCallback(() => {
    pushUrl({}, sortValue);
  }, [pushUrl, sortValue]);

  const onSortChange = React.useCallback(
    (next: string) => {
      pushUrl(values, next);
    },
    [pushUrl, values],
  );

  // --- Main filter row + sticky subset (only actively-applied defs) -----
  const filters: ReactNode[] = [];
  const stickyFilters: ReactNode[] = [];
  for (const def of filterDefs) {
    const value = values[def.key];
    const isActive =
      def.kind === "range"
        ? value !== undefined
        : Array.isArray(value) && value.length > 0;
    const button =
      def.kind === "range" ? (
        <RangeFilterButton
          key={def.key}
          label={def.label}
          axis={def.axis}
          value={value as RangeValue | undefined}
          onChange={(next) => commitFilter(def.key, next)}
        />
      ) : (
        <MultiSelectFilterButton
          key={def.key}
          label={def.label}
          options={def.options}
          value={(value as string[]) ?? []}
          onChange={(next) =>
            commitFilter(def.key, next.length > 0 ? next : undefined)
          }
        />
      );
    filters.push(button);
    if (isActive) stickyFilters.push(button);
  }

  // --- Drawer helpers ----------------------------------------------------
  function toggleDraftMulti(key: string, option: string) {
    setDraft((prev) => {
      const current = (prev[key] as string[] | undefined) ?? [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [key]: next };
    });
  }

  function setDraftRange(key: string, next: RangeValue | undefined) {
    setDraft((prev) => ({ ...prev, [key]: next }));
  }

  const drawerContent: ReactNode = filterDefs.map((def, i) => {
    if (def.kind === "range") {
      const selected = draft[def.key] as RangeValue | undefined;
      const rangeValue = selected
        ? { [def.axis.id]: { min: selected.min, max: selected.max } }
        : undefined;
      return (
        <FilterSection key={def.key} label={def.label} separator={i > 0}>
          <RangeFilter
            value={rangeValue}
            onChange={(next) =>
              setDraftRange(def.key, next?.[def.axis.id])
            }
            axes={[def.axis]}
          />
        </FilterSection>
      );
    }
    const selected = (draft[def.key] as string[] | undefined) ?? [];
    return (
      <FilterSection key={def.key} label={def.label} separator={i > 0}>
        <div className="flex flex-col gap-2">
          {def.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => toggleDraftMulti(def.key, option)}
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
    stickyFilters,
    activeFilterCount,
    hasActiveFilters,
    onClearAll,
    sortOptions,
    sortValue,
    onSortChange,
    drawer: {
      content: drawerContent,
      onOpen: () => setDraft(values),
      onApply: () => pushUrl(draft, sortValue),
      onClearDraft: () => setDraft({}),
      hasActiveDraft,
    },
  };
}
