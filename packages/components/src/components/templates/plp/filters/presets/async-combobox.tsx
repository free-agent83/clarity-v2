"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "../../../../molecules/combobox/combobox";
import { Typography } from "../../../../atoms/typography/typography";
import type {
  FilterControlProps,
  FilterOption,
  PresetFilterDefinition,
} from "../../plp-types";

/**
 * Async multi-select combobox filter preset.
 *
 * Loads options lazily via `definition.searchFn`:
 * - Once with an empty query when the popover first opens.
 * - On each debounced keystroke in the combobox input.
 *
 * Caches selected `FilterOption` objects (value + label) so chips in the
 * combobox and in the active filters strip display correctly even after
 * the user types a new query and the server-side options list changes.
 *
 * The preset writes the cached selected options back into
 * `definition.options` so the registry's chip formatter can resolve
 * labels from value strings without a separate cache.
 */
export function AsyncComboboxFilter({
  value,
  onChange,
  definition: rawDefinition,
}: FilterControlProps) {
  if (!rawDefinition || rawDefinition.preset !== "async-combobox") {
    return null;
  }
  const definition: PresetFilterDefinition = rawDefinition;
  const selectedValues = Array.isArray(value) ? value : [];
  const debounceMs = definition.searchDebounceMs ?? 250;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const selectedCacheRef = useRef<Map<string, FilterOption>>(new Map());

  const runSearch = useCallback(
    async (q: string) => {
      if (!definition.searchFn) return;
      setLoading(true);
      try {
        const results = await definition.searchFn(q);
        setItems(results);
      } finally {
        setLoading(false);
      }
    },
    [definition]
  );

  // Lazy initial load on first open
  useEffect(() => {
    if (open && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      void runSearch("");
    }
  }, [open, hasOpenedOnce, runSearch]);

  // Debounced search on query change
  useEffect(() => {
    if (!open) return;
    if (query === "" && !hasOpenedOnce) return;
    const handle = setTimeout(() => {
      void runSearch(query);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [query, open, debounceMs, runSearch, hasOpenedOnce]);

  function handleValueChange(next: unknown) {
    const nextArray = Array.isArray(next) ? (next as string[]) : [];

    // Cache any newly-selected options by looking them up in current items
    for (const v of nextArray) {
      if (!selectedCacheRef.current.has(v)) {
        const option = items.find((opt) => opt.value === v);
        if (option) {
          selectedCacheRef.current.set(v, option);
        }
      }
    }

    // Write cached selected options back into definition.options so the
    // registry's chip formatter can resolve labels.
    const cachedOptions = nextArray
      .map((v) => selectedCacheRef.current.get(v))
      .filter((o): o is FilterOption => !!o);
    definition.options = cachedOptions;

    onChange(nextArray.length > 0 ? nextArray : undefined);
  }

  // Merge cached selected options into items so chips render correctly
  // even when the current query doesn't include them.
  const itemsWithSelected = mergeWithSelected(items, selectedValues, selectedCacheRef.current);

  return (
    <Combobox
      multiple
      open={open}
      onOpenChange={setOpen}
      value={selectedValues}
      onValueChange={handleValueChange}
      items={itemsWithSelected}
      inputValue={query}
      onInputValueChange={(val: unknown) => setQuery(typeof val === "string" ? val : "")}
    >
      <ComboboxChips>
        {selectedValues.map((v) => {
          const option = selectedCacheRef.current.get(v);
          return (
            <ComboboxChip key={v}>
              {option?.label ?? v}
            </ComboboxChip>
          );
        })}
        <ComboboxChipsInput
          placeholder={
            selectedValues.length === 0
              ? (definition.searchPlaceholder ?? "Search...")
              : undefined
          }
        />
      </ComboboxChips>

      <ComboboxContent>
        <ComboboxList>
          {loading && (
            <Typography
              as="div"
              variant="body-2"
              aria-live="polite"
              className="px-3 py-2 text-muted-foreground"
            >
              Loading...
            </Typography>
          )}
          {!loading &&
            itemsWithSelected.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {option.adornment}
                  {option.label}
                </span>
              </ComboboxItem>
            ))}
          {!loading && itemsWithSelected.length === 0 && (
            <ComboboxEmpty className="px-3 py-2 text-sm text-muted-foreground">
              No results
            </ComboboxEmpty>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/**
 * Merges currently-fetched items with any cached selected options that
 * aren't in the current result set. This ensures selected values always
 * render with a label, even after the user types a new query.
 */
function mergeWithSelected(
  items: FilterOption[],
  selectedValues: string[],
  cache: Map<string, FilterOption>
): FilterOption[] {
  const itemValues = new Set(items.map((i) => i.value));
  const missingSelected = selectedValues
    .filter((v) => !itemValues.has(v))
    .map((v) => cache.get(v))
    .filter((o): o is FilterOption => !!o);
  return [...missingSelected, ...items];
}
