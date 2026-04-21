"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "../../../../atoms/toggle/toggle";

/**
 * Option shape for `SingleSelectChipsFilter`. Each preset declares its own
 * option type so presets stay decoupled and can evolve independently.
 */
export interface SingleSelectChipOption {
  value: string;
  label: string;
  /** Small visual before the label (colour swatch, icon). */
  adornment?: ReactNode;
  /**
   * Replaces the default toggle button content entirely. Receives
   * selection state so the consumer can style the contents accordingly.
   * The preset still owns the outer button shell (click, aria, selection
   * border). Use for rich option layouts (icon on top + label below,
   * card-shaped selectors, etc.).
   */
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

export type SingleSelectChipsValue = string | undefined;

export interface SingleSelectChipsFilterProps {
  value: SingleSelectChipsValue;
  onChange: (value: SingleSelectChipsValue) => void;
  options: SingleSelectChipOption[];
}

/**
 * Single-select chip group — mutually exclusive options.
 *
 * Renders each option as an individual outline `Toggle`. Only one can be
 * pressed at a time. Clicking an already-pressed option clears the
 * filter. Clicking a different option replaces the selected value.
 *
 * Each toggle is independent (not wrapped in a `ToggleGroup`) so options
 * can use `renderOption` for richer layouts like card-shaped selectors.
 */
export function SingleSelectChipsFilter({
  value,
  onChange,
  options,
}: SingleSelectChipsFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
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
