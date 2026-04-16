"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Single-select chip group — mutually exclusive options.
 *
 * Renders each option as an outline toggle button. Only one can be active
 * at a time. Clicking an active option deselects it (clears the filter).
 *
 * Options can customize their content via `renderOption` (e.g., icon on top
 * + label below for card-shaped toggles) or use the default layout
 * (optional adornment + label in a horizontal row).
 */
export function SingleSelectChipsFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options?.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            className={cn(
              "inline-flex items-center justify-center border text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              option.renderOption
                ? "rounded-lg p-2"
                : "rounded-full px-3 py-1.5 gap-1.5",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
            onClick={() => onChange(isSelected ? undefined : option.value)}
          >
            {option.renderOption
              ? option.renderOption({ selected: isSelected })
              : (
                <>
                  {option.adornment}
                  {option.label}
                </>
              )}
          </button>
        );
      })}
    </div>
  );
}
