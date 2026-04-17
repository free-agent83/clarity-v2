"use client";

import { cn } from "@/lib/utils";
import { Toggle } from "../../../../atoms/toggle/toggle";
import type { FilterControlProps } from "../../plp-types";

/**
 * Single-select chip group — mutually exclusive options.
 *
 * Renders each option as an individual outline `Toggle`. Only one can be
 * pressed at a time. Clicking an already-pressed option clears the
 * filter. Clicking a different option replaces the selected value.
 *
 * Each toggle is independent (not wrapped in a `ToggleGroup`) so options
 * can use `renderOption` for richer layouts like card-shaped selectors
 * with an icon on top and a label below.
 */
export function SingleSelectChipsFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options?.map((option) => {
        const isSelected = value === option.value;
        return (
          <Toggle
            key={option.value}
            variant="outline"
            pressed={isSelected}
            onPressedChange={(pressed) =>
              onChange(pressed ? option.value : undefined)
            }
            aria-label={option.label}
            className={cn(
              option.renderOption ? "h-auto min-w-0 p-2" : undefined
            )}
          >
            {option.renderOption ? (
              option.renderOption({ selected: isSelected })
            ) : (
              <>
                {option.adornment}
                {option.label}
              </>
            )}
          </Toggle>
        );
      })}
    </div>
  );
}
