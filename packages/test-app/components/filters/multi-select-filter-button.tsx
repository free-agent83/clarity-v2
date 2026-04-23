"use client";

import * as React from "react";

import { Checkbox, FilterButton } from "@nivoda/components";

type MultiSelectFilterButtonProps = {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
};

const MAX_CHIP_VALUES = 3;

function formatChipSummary(values: string[]): string {
  if (values.length <= MAX_CHIP_VALUES) return values.join(", ");
  const head = values.slice(0, MAX_CHIP_VALUES).join(", ");
  return `${head}, +${values.length - MAX_CHIP_VALUES}`;
}

export function MultiSelectFilterButton({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterButtonProps) {
  const isActive = value.length > 0;
  const chipSummary = isActive ? formatChipSummary(value) : undefined;

  return (
    <FilterButton<string[]>
      label={label}
      isActive={isActive}
      chipSummary={chipSummary}
      initialValue={value}
      onApply={(draft) => onChange(draft ?? [])}
      onClear={() => onChange([])}
      onDismiss={() => onChange([])}
    >
      {(draft, setDraft) => {
        const current = draft ?? [];
        function toggle(option: string) {
          const next = current.includes(option)
            ? current.filter((v) => v !== option)
            : [...current, option];
          setDraft(next.length > 0 ? next : undefined);
        }
        return (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={current.includes(option)}
                  onCheckedChange={() => toggle(option)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      }}
    </FilterButton>
  );
}
