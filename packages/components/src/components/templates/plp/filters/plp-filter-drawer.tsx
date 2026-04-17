"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../atoms/button/button";
import { Separator } from "../../../atoms/separator/separator";
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;
}) {
  // Draft state scoped to the current open session. Initialised from the
  // consumer's applied `filterState` when the drawer opens; mutations
  // stay local until the user clicks "Show X results".
  const [draftState, setDraftState] = useState<FilterState>(filterState);

  useEffect(() => {
    if (open) {
      setDraftState(filterState);
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
      return next;
    });
  }

  function handleClearDraft() {
    setDraftState({});
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col"
        aria-label="All filters"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
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
                  <h3 className="text-sm font-semibold text-foreground">
                    {definition.label}
                  </h3>
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

        {/* Sticky footer */}
        <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={handleClearDraft}>
            Clear filters
          </Button>
          <Button className="flex-1" onClick={handleApply}>
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
