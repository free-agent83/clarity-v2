"use client";

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
 * filter label as heading. The footer is sticky with a result-count-aware
 * primary action and a "Clear filters" secondary action.
 */
export function PlpFilterDrawer({
  open,
  onOpenChange,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  onClearAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;
  onClearAll: () => void;
}) {
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
                ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
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
                    value={filterState[definition.id]}
                    onChange={(value) => onFilterChange(definition.id, value)}
                    options={controlOptions}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClearAll}>
            Clear filters
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            {formattedCount
              ? `Show ${formattedCount} results`
              : "Show results"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
