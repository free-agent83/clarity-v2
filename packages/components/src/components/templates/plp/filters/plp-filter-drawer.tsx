"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../atoms/button/button";
import { Separator } from "../../../atoms/separator/separator";
import { Typography } from "../../../atoms/typography/typography";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../../molecules/sheet/sheet";
import { resolveFilterControl } from "./plp-filter-registry";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
} from "../plp-types";

/**
 * All Filters drawer — a left-side Sheet containing the complete filter list.
 *
 * Filters render in definition order, each in its own section with the
 * filter label as heading. Changes made inside the drawer are buffered
 * into local draft state and only committed to the consumer's
 * `filterState` when the user clicks the primary action ("Show X results").
 * Closing the drawer any other way (clicking outside, pressing Escape,
 * etc.) discards the draft.
 *
 * The footer is sticky with a result-count-aware primary action and a
 * "Clear filters" secondary action.
 */
export function PlpFilterDrawer({
  open,
  onOpenChange,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  isCountLoading = false,
  onDraftFilterStateChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;
  /**
   * When `true`, the "Show X results" button shows a loading state
   * (spinner, disabled). Consumers set this while a preview-count
   * request is in flight so the button reflects that the displayed
   * count is about to update.
   */
  isCountLoading?: boolean;
  /**
   * Fires whenever the draft filter state inside the drawer changes, plus
   * once on open with the initial state (= applied `filterState`).
   *
   * Required: the drawer is designed around a live preview-count pattern.
   * Consumers use this to fetch a preview result count from their backend
   * and drive `filteredResultsCount` in real time while the user edits,
   * so the "Show X results" button reflects what the draft would yield.
   * Debouncing is the consumer's responsibility.
   *
   * If a consumer genuinely doesn't want a live preview count, pass a
   * no-op — but the expected pattern is to wire this to a debounced API
   * call and update `filteredResultsCount` accordingly.
   *
   * Not called when the drawer closes without applying — the applied
   * `filterState` is unchanged, so the consumer's existing count remains
   * correct. On the next open, this fires again with the applied state
   * so any stale draft-based count is superseded.
   */
  onDraftFilterStateChange: (draftState: FilterState) => void;
}) {
  // Draft state scoped to the current open session. Initialised from the
  // consumer's applied `filterState` when the drawer opens; mutations
  // stay local until the user clicks "Show X results".
  const [draftState, setDraftState] = useState<FilterState>(filterState);

  useEffect(() => {
    if (open) {
      setDraftState(filterState);
      onDraftFilterStateChange(filterState);
    }
    // Intentionally not reacting to filterState changes while open — external
    // changes during a draft session would clobber the user's in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleDraftChange(filterId: string, value: FilterValue) {
    setDraftState((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      onDraftFilterStateChange(next);
      return next;
    });
  }

  function handleClearDraft() {
    const next: FilterState = {};
    setDraftState(next);
    onDraftFilterStateChange(next);
  }

  function handleApply() {
    // Commit diffs between applied state and draft state to the consumer.
    const allIds = new Set([
      ...Object.keys(filterState),
      ...Object.keys(draftState),
    ]);
    for (const id of allIds) {
      if (!valuesEqual(filterState[id], draftState[id])) {
        onFilterChange(id, draftState[id]);
      }
    }
    onOpenChange(false);
  }

  const formattedCount =
    filteredResultsCount !== undefined
      ? new Intl.NumberFormat("en-US").format(filteredResultsCount)
      : null;

  const hasActiveDraft = Object.values(draftState).some(
    (v) => v !== undefined
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col"
        aria-label="All filters"
      >
        <SheetHeader className="flex-row items-center justify-between pr-10">
          <SheetTitle>Filters</SheetTitle>
          {hasActiveDraft && (
            <Button variant="link" size="sm" onClick={handleClearDraft}>
              Clear
            </Button>
          )}
        </SheetHeader>

        {/* Scrollable filter list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filters.map((definition, index) => {
            const FilterControl = resolveFilterControl(definition);

            // Build options — boolean-chip gets chipLabel as option
            const controlOptions =
              definition.preset === "boolean-chip"
                ? [
                    {
                      value: "true",
                      label:
                        (definition as any).chipLabel || definition.label,
                    },
                  ]
                : "options" in definition
                  ? definition.options
                  : undefined;

            return (
              <div key={definition.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <Typography as="h3" variant="body-2" emphasis>
                    {definition.label}
                  </Typography>
                  <FilterControl
                    value={draftState[definition.id]}
                    onChange={(value) =>
                      handleDraftChange(definition.id, value)
                    }
                    options={controlOptions}
                    definition={definition}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky footer — single primary action. "Clear" lives in the
            header next to the close button when any filter is active. */}
        <SheetFooter className="border-t px-6 py-4">
          <Button
            block
            onClick={handleApply}
            loading={isCountLoading}
            disabled={isCountLoading}
          >
            {formattedCount ? `Show ${formattedCount} results` : "Show results"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Shallow-equal check sufficient for `FilterValue` shapes.
 *
 * Uses JSON serialisation to compare object/array values. Filter values
 * have a bounded shape (primitives, arrays of strings, `{ min, max }`,
 * nested axis records) and preset components construct them with
 * consistent key order, so stringify-equality is reliable here.
 */
function valuesEqual(a: FilterValue, b: FilterValue): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
