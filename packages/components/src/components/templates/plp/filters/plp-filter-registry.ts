import type { ComponentType, ReactNode } from "react";
import type {
  FilterDefinition,
  FilterControlProps,
  FilterValue,
  PresetFilterDefinition,
  CustomFilterDefinition,
} from "../plp-types";
import { BooleanChipFilter } from "./presets/boolean-chip";
import { SingleSelectChipsFilter } from "./presets/single-select-chips";
import { MultiSelectChipsFilter } from "./presets/multi-select-chips";
import { SingleSelectDropdownFilter } from "./presets/single-select-dropdown";
import { RangeSliderFilter } from "./presets/range-slider";
import { MultiAxisRangeFilter } from "./presets/multi-axis-range";
import { AsyncComboboxFilter } from "./presets/async-combobox";

/**
 * Formats a numeric unit either as a prefix (for currency) or suffix.
 */
function formatUnitValue(n: number, unit?: string): string {
  if (!unit) return String(n);
  const isCurrencyPrefix =
    ["$", "€", "£", "¥"].some((c) => unit.startsWith(c)) ||
    ["USD", "EUR", "GBP", "JPY"].includes(unit);
  return isCurrencyPrefix ? `${unit}${n}` : `${n}${unit}`;
}

/**
 * Formats a single range `{ min, max }` for display in an active filter chip.
 */
function formatRangeChip(min: number, max: number, unit?: string): string {
  return `${formatUnitValue(min, unit)}\u2013${formatUnitValue(max, unit)}`;
}

/**
 * Formats a multi-axis range value for display in an active filter chip.
 *
 * Uses the first character of each axis label as an abbreviation.
 * Truncates to first two axes + "+N more" if more than two axes are active.
 */
function formatMultiAxisChip(
  axisValues: Record<string, { min: number; max: number }>,
  axes: NonNullable<PresetFilterDefinition["axes"]>
): string {
  const activeSegments: string[] = [];
  for (const axis of axes) {
    const v = axisValues[axis.id];
    if (!v) continue;
    const abbrev = axis.label.charAt(0).toUpperCase();
    activeSegments.push(
      `${abbrev} ${formatUnitValue(v.min, axis.unit)}\u2013${formatUnitValue(v.max, axis.unit)}`
    );
  }
  if (activeSegments.length === 0) return "";
  if (activeSegments.length <= 2) return activeSegments.join(", ");
  const remaining = activeSegments.length - 2;
  return `${activeSegments[0]}, ${activeSegments[1]} +${remaining} more`;
}

/**
 * Formats an array of labels for display in an active filter chip.
 *
 * - 0 labels → empty string (not expected; caller should gate on value).
 * - 1 label  → the label itself.
 * - 2 labels → `"Label1, Label2"`.
 * - 3+ labels → `"Label1, Label2 +N more"` (N = labels.length - 2).
 */
function formatMultiSelectChip(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  const remaining = labels.length - 2;
  return `${labels[0]}, ${labels[1]} +${remaining} more`;
}

/** A component or function that renders a filter control. */
export type FilterRenderer =
  | ComponentType<FilterControlProps>
  | ((props: FilterControlProps) => ReactNode);

const PRESET_MAP: Record<string, FilterRenderer> = {
  "boolean-chip": BooleanChipFilter,
  "single-select-chips": SingleSelectChipsFilter,
  "multi-select-chips": MultiSelectChipsFilter,
  "single-select-dropdown": SingleSelectDropdownFilter,
  "range-slider": RangeSliderFilter,
  "multi-axis-range": MultiAxisRangeFilter,
  "async-combobox": AsyncComboboxFilter,
};

/**
 * Resolves a filter definition to the component that renders its control.
 *
 * For preset filters, looks up the preset name in the built-in registry.
 * For custom filters, returns the consumer-supplied `renderControl` function.
 */
export function resolveFilterControl(
  definition: FilterDefinition
): FilterRenderer {
  if (definition.preset === "custom") {
    return (definition as CustomFilterDefinition).renderControl;
  }
  const component = PRESET_MAP[definition.preset];
  if (!component) {
    throw new Error(`Unknown filter preset: ${definition.preset}`);
  }
  return component;
}

/**
 * Formats a filter's current value into a human-readable string for display
 * in active filter chips.
 *
 * Preset filters have built-in formatters. Custom filters use the
 * consumer-supplied `formatChipValue` function.
 */
export function formatFilterChipValue(
  definition: FilterDefinition,
  value: FilterValue
): string {
  if (value === undefined || value === null) return "";

  if (definition.preset === "custom") {
    const custom = definition as CustomFilterDefinition;
    return custom.formatChipValue
      ? custom.formatChipValue(value)
      : String(value);
  }

  const preset = definition as PresetFilterDefinition;

  switch (preset.preset) {
    case "boolean-chip":
      return preset.chipLabel || preset.label;

    case "single-select-chips":
    case "single-select-dropdown": {
      const option = preset.options?.find((o) => o.value === value);
      return option?.label ?? String(value);
    }

    case "multi-select-chips":
    case "async-combobox": {
      if (!Array.isArray(value)) return String(value);
      const labels = value.map((v) => {
        const option = preset.options?.find((o) => o.value === v);
        return option?.label ?? v;
      });
      return formatMultiSelectChip(labels);
    }

    case "range-slider": {
      if (!value || typeof value !== "object" || !("min" in value)) {
        return "";
      }
      const { min, max } = value as { min: number; max: number };
      return formatRangeChip(min, max, preset.unit);
    }

    case "multi-axis-range": {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "";
      }
      const axisValues = value as Record<string, { min: number; max: number }>;
      return formatMultiAxisChip(axisValues, preset.axes ?? []);
    }

    default:
      return String(value);
  }
}
