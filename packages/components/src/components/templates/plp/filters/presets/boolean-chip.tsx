"use client";

import { useId } from "react";
import { Label } from "../../../../atoms/label/label";
import { Switch } from "../../../../atoms/switch/switch";

/**
 * Value shape for `BooleanChipFilter`. Strictly `true` (active) or
 * `undefined` (cleared) — no `false` — so the value is symmetric with how
 * other presets encode an empty state.
 */
export type BooleanChipValue = true | undefined;

export interface BooleanChipFilterProps {
  value: BooleanChipValue;
  onChange: (value: BooleanChipValue) => void;
  /** Label shown next to the switch (e.g. "Only Nivoda Curated items"). */
  label: string;
}

/**
 * Boolean on/off filter control.
 *
 * Renders a `Switch` paired with a `Label`. Value is strictly `true`
 * (active) or `undefined` (cleared); there is no explicit `false`.
 */
export function BooleanChipFilter({ value, onChange, label }: BooleanChipFilterProps) {
  const id = useId();
  const isActive = value === true;

  function handleCheckedChange(checked: boolean) {
    onChange(checked ? true : undefined);
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        id={id}
        checked={isActive}
        onCheckedChange={handleCheckedChange}
      />
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
