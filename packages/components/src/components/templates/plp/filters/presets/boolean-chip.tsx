"use client";

import { useId } from "react";
import { Label } from "../../../../atoms/label/label";
import { Switch } from "../../../../atoms/switch/switch";
import type { FilterControlProps } from "../../plp-types";

/**
 * Boolean on/off filter control.
 *
 * Renders a `Switch` paired with a `Label`. The label text is supplied
 * via the `chipLabel` field on the filter definition — it reaches this
 * component through the `options` prop as a single-element array with
 * the label as its `label`. If no options are provided, renders a
 * generic "Enabled" label.
 *
 * The filter value is strictly `true` (active) or `undefined` (cleared).
 */
export function BooleanChipFilter({ value, onChange, options }: FilterControlProps) {
  const id = useId();
  const isActive = value === true;
  const label = options?.[0]?.label ?? "Enabled";

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
