"use client";

import { cn } from "@/lib/utils";
import { Toggle } from "../../../../atoms/toggle/toggle";
import type { FilterControlProps } from "../../plp-types";

/**
 * Multi-select chip group with optional adornments.
 *
 * Renders each option as an individual outline `Toggle`. Any number of
 * options can be pressed simultaneously. Clicking toggles the option's
 * presence in the selected array.
 *
 * Each toggle is independent (not wrapped in a `ToggleGroup`) so options
 * can use `renderOption` for richer layouts like card-shaped cut-shape
 * selectors with an icon on top and a label below.
 */
export function MultiSelectChipsFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  const selected = Array.isArray(value) ? value : [];

  function toggle(optionValue: string) {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    onChange(next.length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options?.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Toggle
            key={option.value}
            variant="outline"
            pressed={isSelected}
            onPressedChange={() => toggle(option.value)}
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
