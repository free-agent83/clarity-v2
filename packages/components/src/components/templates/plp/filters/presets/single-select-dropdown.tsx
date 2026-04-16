"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../molecules/select/select";
import type { FilterControlProps } from "../../plp-types";

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
}: FilterControlProps) {
  const stringValue = typeof value === "string" ? value : "";

  return (
    <Select
      value={stringValue}
      onValueChange={(v) => onChange(v || undefined)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
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
