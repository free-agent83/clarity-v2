import { describe, it, expect } from "vitest";
import {
  resolveFilterControl,
  formatFilterChipValue,
} from "./plp-filter-registry";
import type {
  PresetFilterDefinition,
  CustomFilterDefinition,
} from "../plp-types";

describe("resolveFilterControl", () => {
  it("returns the correct component for each preset name", () => {
    const presets = [
      "boolean-chip",
      "single-select-chips",
      "multi-select-chips",
      "single-select-dropdown",
    ] as const;

    for (const preset of presets) {
      const def: PresetFilterDefinition = {
        id: "test",
        label: "Test",
        preset,
      };
      const result = resolveFilterControl(def);
      expect(result).toBeDefined();
      expect(typeof result).toBe("function");
    }
  });

  it("returns the custom renderControl for custom filters", () => {
    const renderControl = () => null;
    const def: CustomFilterDefinition = {
      id: "test",
      label: "Test",
      preset: "custom",
      renderControl,
    };
    const result = resolveFilterControl(def);
    expect(result).toBe(renderControl);
  });
});

describe("formatFilterChipValue", () => {
  it("formats boolean filter as the filter label", () => {
    const def: PresetFilterDefinition = {
      id: "curated",
      label: "Nivoda Curated",
      preset: "boolean-chip",
      chipLabel: "Only Nivoda Curated items",
    };
    expect(formatFilterChipValue(def, true)).toBe("Only Nivoda Curated items");
  });

  it("formats single-select as the selected option label", () => {
    const def: PresetFilterDefinition = {
      id: "shipping",
      label: "Shipping",
      preset: "single-select-chips",
      options: [
        { value: "1-3", label: "1-3 days" },
        { value: "5", label: "5 days or less" },
      ],
    };
    expect(formatFilterChipValue(def, "1-3")).toBe("1-3 days");
  });

  it("formats multi-select as comma-joined labels", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue", "red"])).toBe("Blue, Red");
  });

  it("formats single-select-dropdown as the selected option label", () => {
    const def: PresetFilterDefinition = {
      id: "location",
      label: "Location",
      preset: "single-select-dropdown",
      options: [
        { value: "us", label: "United States" },
        { value: "eu", label: "Europe" },
      ],
    };
    expect(formatFilterChipValue(def, "us")).toBe("United States");
  });

  it("uses custom formatChipValue for custom filters", () => {
    const def: CustomFilterDefinition = {
      id: "custom",
      label: "Custom",
      preset: "custom",
      renderControl: () => null,
      formatChipValue: (value) => `Custom: ${value}`,
    };
    expect(formatFilterChipValue(def, "hello")).toBe("Custom: hello");
  });

  it("returns empty string for undefined value", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [],
    };
    expect(formatFilterChipValue(def, undefined)).toBe("");
  });
});
