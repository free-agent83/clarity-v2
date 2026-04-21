"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "../../../../atoms/toggle/toggle";

/**
 * Option shape for `MultiSelectChipsFilter`. Each preset declares its own
 * option type so presets stay decoupled and can evolve independently.
 */
export interface MultiSelectChipOption {
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

export type MultiSelectChipsValue = string[] | undefined;

export interface MultiSelectChipsFilterProps {
  value: MultiSelectChipsValue;
  onChange: (value: MultiSelectChipsValue) => void;
  options: MultiSelectChipOption[];
}

/**
 * Multi-select chip group with optional adornments.
 *
 * Renders each option as an individual outline `Toggle`. Any number of
 * options can be pressed simultaneously. Clicking toggles the option's
 * presence in the selected array.
 *
 * Each toggle is independent (not wrapped in a `ToggleGroup`) so options
 * can use `renderOption` for richer layouts like card-shaped selectors.
 */
export function MultiSelectChipsFilter({
  value,
  onChange,
  options,
}: MultiSelectChipsFilterProps) {
  const selected = value ?? [];

  function toggle(optionValue: string) {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    onChange(next.length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
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
