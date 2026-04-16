"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Multi-select chip group with optional adornments.
 *
 * Any number of options can be active simultaneously. Renders as outline
 * toggle buttons by default.
 *
 * Options can customize their content via `renderOption` (e.g., icon on top
 * + label below for card-shaped toggles like cut shape selectors) or use
 * the default layout (optional adornment + label in a horizontal row).
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
    <div className="flex flex-wrap gap-2" role="group">
      {options?.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
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
            onClick={() => toggle(option.value)}
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
