"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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

/**
 * Option shape for `AsyncComboboxFilter`. Each preset declares its own
 * option type so presets stay decoupled and can evolve independently.
 */
export interface AsyncComboboxOption {
  value: string;
  label: string;
  /** Small visual before the label (flag icon, swatch). */
  adornment?: ReactNode;
}

/**
 * Value shape for `AsyncComboboxFilter`. Carries the full Option objects
 * (not just values) so labels are retained across search-query changes
 * without the component holding an internal selection cache. Consumers
 * pass `Option[]` back in and receive `Option[]` in `onChange`.
 */
export type AsyncComboboxValue = AsyncComboboxOption[] | undefined;

export interface AsyncComboboxFilterProps {
  value: AsyncComboboxValue;
  onChange: (value: AsyncComboboxValue) => void;
  /**
   * Called to load options. Invoked once with an empty query when the
   * popover first opens, then on each debounced query change.
   */
  searchFn: (query: string) => Promise<AsyncComboboxOption[]>;
  /** Debounce delay for `searchFn` invocations on input. Defaults to 250ms. */
  searchDebounceMs?: number;
  /** Placeholder text for the combobox input. */
  searchPlaceholder?: string;
}

/**
 * Async multi-select combobox filter preset.
 *
 * Loads options lazily via `searchFn`:
 * - Once with an empty query when the popover first opens.
 * - On each debounced keystroke in the combobox input.
 *
 * Selection state is a fully controlled `Option[]` on the consumer side
 * — labels are retained across query changes without any internal cache,
 * and the consumer can format chip summaries directly from the value.
 */
export function AsyncComboboxFilter({
  value,
  onChange,
  searchFn,
  searchDebounceMs = 250,
  searchPlaceholder,
}: AsyncComboboxFilterProps) {
  const selectedOptions = value ?? [];
  const selectedValues = selectedOptions.map((o) => o.value);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AsyncComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const runSearch = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const results = await searchFn(q);
        setItems(results);
      } finally {
        setLoading(false);
      }
    },
    [searchFn]
  );

  useEffect(() => {
    if (open && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      void runSearch("");
    }
  }, [open, hasOpenedOnce, runSearch]);

  useEffect(() => {
    if (!open) return;
    if (query === "" && !hasOpenedOnce) return;
    const handle = setTimeout(() => {
      void runSearch(query);
    }, searchDebounceMs);
    return () => clearTimeout(handle);
  }, [query, open, searchDebounceMs, runSearch, hasOpenedOnce]);

  function handleValueChange(next: unknown) {
    const nextValues = Array.isArray(next) ? (next as string[]) : [];
    const pool = [...selectedOptions, ...items];
    const nextOptions = nextValues
      .map((v) => pool.find((o) => o.value === v))
      .filter((o): o is AsyncComboboxOption => !!o);
    onChange(nextOptions.length > 0 ? nextOptions : undefined);
  }

  // Merge selected options with current items so chips render correctly
  // even when the current query doesn't include them.
  const itemsWithSelected = mergeWithSelected(items, selectedOptions);

  return (
    <Combobox
      multiple
      open={open}
      onOpenChange={setOpen}
      value={selectedValues}
      onValueChange={handleValueChange}
      items={itemsWithSelected}
      inputValue={query}
      onInputValueChange={(val: unknown) =>
        setQuery(typeof val === "string" ? val : "")
      }
    >
      <ComboboxChips>
        {selectedOptions.map((option) => (
          <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder={
            selectedOptions.length === 0
              ? (searchPlaceholder ?? "Search...")
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
 * Prepends any selected options not present in the current result set so
 * chips and list items stay renderable across query changes.
 */
function mergeWithSelected(
  items: AsyncComboboxOption[],
  selectedOptions: AsyncComboboxOption[]
): AsyncComboboxOption[] {
  const itemValues = new Set(items.map((i) => i.value));
  const missing = selectedOptions.filter((o) => !itemValues.has(o.value));
  return [...missing, ...items];
}
