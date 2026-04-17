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

    default:
      return String(value);
  }
}
