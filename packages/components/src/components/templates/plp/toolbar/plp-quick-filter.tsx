"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../atoms/popover/popover";
import { resolveFilterControl } from "../filters/plp-filter-registry";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Quick filter -- a toolbar button that opens a popover containing
 * the registry-resolved filter control.
 *
 * The popover includes Apply and Clear buttons. The button shows an
 * active visual state when the filter has a value.
 */
export function PlpQuickFilter({
  definition,
  filterState,
  onFilterChange,
}: {
  definition: FilterDefinition;
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<FilterValue>(
    filterState[definition.id]
  );

  const isActive = filterState[definition.id] !== undefined;
  const FilterControl = resolveFilterControl(definition);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setLocalValue(filterState[definition.id]);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onFilterChange(definition.id, localValue);
    setOpen(false);
  }

  function handleClear() {
    onFilterChange(definition.id, undefined);
    setLocalValue(undefined);
    setOpen(false);
  }

  // Build options for the control -- boolean-chip gets chipLabel as a single option
  const controlOptions =
    definition.preset === "boolean-chip"
      ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
      : "options" in definition
        ? definition.options
        : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          className={cn("shrink-0", isActive && "bg-primary text-primary-foreground")}
        >
          {definition.label}
          {isActive && (
            <span className="ml-1 text-xs opacity-70">
              &#x2022;
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-4"
        style={
          definition.popoverWidth
            ? { width: typeof definition.popoverWidth === "number"
                ? `${definition.popoverWidth}px`
                : definition.popoverWidth }
            : undefined
        }
        aria-label={`Filter: ${definition.label}`}
      >
        <div className="space-y-4">
          <FilterControl
            value={localValue}
            onChange={setLocalValue}
            options={controlOptions}
            definition={definition}
          />
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
