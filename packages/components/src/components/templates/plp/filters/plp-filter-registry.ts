import type { ComponentType } from "react";
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

type FilterRenderer =
  | ComponentType<FilterControlProps>
  | ((props: FilterControlProps) => React.ReactNode);

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

    case "multi-select-chips": {
      if (!Array.isArray(value)) return String(value);
      return value
        .map((v) => {
          const option = preset.options?.find((o) => o.value === v);
          return option?.label ?? v;
        })
        .join(", ");
    }

    default:
      return String(value);
  }
}
