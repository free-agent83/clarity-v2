"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../molecules/select/select";

/**
 * Option shape for `SingleSelectDropdownFilter`. Each preset declares its
 * own option type so presets stay decoupled and can evolve independently.
 */
export interface SingleSelectDropdownOption {
  value: string;
  label: string;
  /** Small visual before the label (flag icon, swatch). */
  adornment?: ReactNode;
}

export type SingleSelectDropdownValue = string | undefined;

export interface SingleSelectDropdownFilterProps {
  value: SingleSelectDropdownValue;
  onChange: (value: SingleSelectDropdownValue) => void;
  options: SingleSelectDropdownOption[];
  placeholder?: string;
}

/**
 * Dropdown filter using the design system Select molecule.
 *
 * Used when the option list is too long for chips or when free-text
 * search within the dropdown helps discovery.
 */
export function SingleSelectDropdownFilter({
  value,
  onChange,
  options,
  placeholder = "Select...",
}: SingleSelectDropdownFilterProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange(v || undefined)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.adornment}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
