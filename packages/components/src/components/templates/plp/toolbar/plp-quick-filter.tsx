"use client";

import { useState } from "react";
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
 * The popover's Apply / Clear buttons are provided by `FilterButton`
 * itself. This component manages the local draft value and wires
 * `onApply` / `onClear` / `onOpenChange` to commit-on-apply semantics
 * matching the drawer.
 *
 * Used for both pinned "quick filters" (always present in the toolbar,
 * even when empty) and engaged non-quick filters (shown only when they
 * have a value). The branching between those two cases happens at the
 * toolbar level.
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
  const value = filterState[definition.id];
  const [localValue, setLocalValue] = useState<FilterValue>(value);

  const isActive = value !== undefined;
  const FilterControl = resolveFilterControl(definition);

  const valueSummary = isActive
    ? formatFilterChipValue(definition, value)
    : undefined;

  function handleOpenChange(open: boolean) {
    if (open) {
      // Reset draft to the currently applied value each time the popover opens
      setLocalValue(filterState[definition.id]);
    }
  }

  function handleApply() {
    onFilterChange(definition.id, localValue);
  }

  function handleClear() {
    onFilterChange(definition.id, undefined);
    setLocalValue(undefined);
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
      onOpenChange={handleOpenChange}
      onApply={handleApply}
      onClear={handleClear}
      onDismiss={isActive ? handleDismiss : undefined}
    >
      <FilterControl
        value={localValue}
        onChange={setLocalValue}
        options={controlOptions}
        definition={definition}
      />
    </FilterButton>
  );
}
