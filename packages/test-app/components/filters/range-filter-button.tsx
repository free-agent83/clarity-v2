"use client";

import * as React from "react";

import {
  FilterButton,
  RangeFilter,
  type RangeAxis,
} from "@nivoda/components";

type RangeFilterButtonProps = {
  label: string;
  axis: RangeAxis;
  value: { min: number; max: number } | undefined;
  onChange: (next: { min: number; max: number } | undefined) => void;
};

function formatBounds(
  axis: RangeAxis,
  value: { min: number; max: number },
): string {
  const unit = axis.unit ?? "";
  const minAtFloor = value.min === axis.min;
  const maxAtCeiling = value.max === axis.max;

  if (minAtFloor && maxAtCeiling) return "";
  if (minAtFloor) return `up to ${value.max}${unit}`;
  if (maxAtCeiling) return `${value.min}${unit}+`;
  return `${value.min}–${value.max}${unit}`;
}

/**
 * Main-row analog of `MultiSelectFilterButton` for single-axis range
 * filters. Composes the design-system `FilterButton` render-prop with a
 * `RangeFilter` inside the popover. Commits on Apply via the button's
 * built-in draft lifecycle.
 */
export function RangeFilterButton({
  label,
  axis,
  value,
  onChange,
}: RangeFilterButtonProps) {
  const isActive = value !== undefined;
  const chipSummary = isActive ? formatBounds(axis, value) : undefined;

  return (
    <FilterButton<{ min: number; max: number }>
      label={label}
      isActive={isActive}
      chipSummary={chipSummary}
      initialValue={value}
      onApply={(draft) => onChange(draft)}
      onClear={() => onChange(undefined)}
      onDismiss={() => onChange(undefined)}
      popoverWidth={320}
    >
      {(draft, setDraft) => {
        const rangeValue = draft
          ? { [axis.id]: { min: draft.min, max: draft.max } }
          : undefined;
        return (
          <RangeFilter
            value={rangeValue}
            onChange={(next) => {
              const axisValue = next?.[axis.id];
              setDraft(axisValue);
            }}
            axes={[axis]}
          />
        );
      }}
    </FilterButton>
  );
}
