"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "../../atoms/toggle/toggle";

export interface ChipSelectOption {
  value: string;
  label: string;
  /** Small visual before the label (colour swatch, icon). */
  adornment?: ReactNode;
  /**
   * Replaces the default toggle content entirely. Receives selection
   * state so the consumer can style accordingly. The preset still owns
   * the outer button shell (click, aria, selection border).
   */
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

type SingleProps = {
  mode: "single";
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: ChipSelectOption[];
};

type MultipleProps = {
  mode: "multiple";
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
  options: ChipSelectOption[];
};

export type ChipSelectFilterProps = SingleProps | MultipleProps;

/**
 * Chip group with either single-select or multi-select semantics.
 *
 * - `mode: "single"` — clicking an option replaces the selection;
 *   clicking an already-pressed option clears the filter.
 * - `mode: "multiple"` — clicking toggles the option's presence in
 *   the selected array; emptying the selection collapses the value
 *   to `undefined`.
 *
 * Each chip is an independent `Toggle` so `renderOption` can drive
 * richer layouts (card-shaped selectors etc.). Requires at least two
 * options; use a `Toggle` atom directly for single-option boolean
 * filters.
 */
export function ChipSelectFilter(props: ChipSelectFilterProps) {
  const { options } = props;

  function isSelected(optionValue: string): boolean {
    if (props.mode === "single") return props.value === optionValue;
    return (props.value ?? []).includes(optionValue);
  }

  function handleToggle(optionValue: string, pressed: boolean) {
    if (props.mode === "single") {
      props.onChange(pressed ? optionValue : undefined);
      return;
    }
    const current = props.value ?? [];
    const next = pressed
      ? [...current, optionValue]
      : current.filter((v) => v !== optionValue);
    props.onChange(next.length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Toggle
            key={option.value}
            variant="outline"
            pressed={selected}
            onPressedChange={(pressed) => handleToggle(option.value, pressed)}
            aria-label={option.label}
            className={cn(
              option.renderOption ? "h-auto min-w-0 p-2" : undefined
            )}
          >
            {option.renderOption ? (
              option.renderOption({ selected })
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
