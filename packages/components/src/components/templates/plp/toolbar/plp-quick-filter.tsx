"use client";

import { useState } from "react";
import { Button } from "../../../atoms/button/button";
import { FilterButton } from "../../../atoms/filter-button/filter-button";
import {
  resolveFilterControl,
  formatFilterChipValue,
} from "../filters/plp-filter-registry";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Toolbar-row filter control.
 *
 * Renders a `FilterButton` whose active/inactive state is driven by the
 * current `filterState[definition.id]` value:
 *
 * - Empty value → inactive `FilterButton` showing just the label.
 * - Any value → active `FilterButton` showing `label: valueSummary` with
 *   an inline dismiss X that clears the filter.
 *
 * The popover wraps the registry-resolved filter control with Apply /
 * Clear actions. Edits happen against local `localValue` state and are
 * committed to the consumer via `onFilterChange` only when Apply is
 * clicked — same commit-on-apply pattern as the drawer.
 *
 * This component is used for both pinned "quick filters" (always present
 * in the toolbar, even when empty) and engaged non-quick filters (shown
 * only when they have a value). The component itself doesn't care —
 * that branching happens at the toolbar level.
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

  const value = filterState[definition.id];
  const isActive = value !== undefined;
  const FilterControl = resolveFilterControl(definition);

  const valueSummary = isActive
    ? formatFilterChipValue(definition, value)
    : undefined;

  function handleOpenChange(nextOpen: boolean) {
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

  function handleDismiss() {
    onFilterChange(definition.id, undefined);
  }

  // Build options for the control — boolean-chip gets chipLabel as a single option
  const controlOptions =
    definition.preset === "boolean-chip"
      ? [
          {
            value: "true",
            label: (definition as any).chipLabel || definition.label,
          },
        ]
      : "options" in definition
        ? definition.options
        : undefined;

  return (
    <FilterButton
      label={definition.label}
      valueSummary={valueSummary}
      popoverWidth={definition.popoverWidth}
      open={open}
      onOpenChange={handleOpenChange}
      onDismiss={isActive ? handleDismiss : undefined}
      popoverContent={
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
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      }
    />
  );
}
