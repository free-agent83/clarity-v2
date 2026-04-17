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

  it("formats multi-select with 3+ selections as first-two-plus-more", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
        { value: "teal", label: "Teal" },
        { value: "pink", label: "Pink" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue", "green", "red"])).toBe(
      "Blue, Green +1 more"
    );
    expect(formatFilterChipValue(def, ["blue", "green", "red", "teal", "pink"])).toBe(
      "Blue, Green +3 more"
    );
  });

  it("still formats multi-select with 1 or 2 selections without truncation", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue"])).toBe("Blue");
    expect(formatFilterChipValue(def, ["blue", "green"])).toBe("Blue, Green");
  });

  it("formats range-slider with currency unit as prefix", () => {
    const def: PresetFilterDefinition = {
      id: "price",
      label: "Price",
      preset: "range-slider",
      min: 0,
      max: 10000,
      unit: "$",
    };
    expect(formatFilterChipValue(def, { min: 100, max: 500 })).toBe("$100\u2013$500");
  });

  it("formats range-slider with non-currency unit as suffix", () => {
    const def: PresetFilterDefinition = {
      id: "carat",
      label: "Carat",
      preset: "range-slider",
      min: 0,
      max: 10,
      unit: "ct",
    };
    expect(formatFilterChipValue(def, { min: 1, max: 3.5 })).toBe("1ct\u20133.5ct");
  });

  it("formats multi-axis-range with single active axis", () => {
    const def: PresetFilterDefinition = {
      id: "size",
      label: "Size",
      preset: "multi-axis-range",
      axes: [
        { id: "length", label: "Length", min: 0, max: 20, unit: "mm" },
        { id: "width", label: "Width", min: 0, max: 20, unit: "mm" },
        { id: "depth", label: "Depth", min: 0, max: 10, unit: "mm" },
      ],
    };
    expect(formatFilterChipValue(def, { length: { min: 5, max: 10 } })).toBe(
      "L 5mm\u201310mm"
    );
  });

  it("formats multi-axis-range with three active axes (no truncation)", () => {
    const def: PresetFilterDefinition = {
      id: "size",
      label: "Size",
      preset: "multi-axis-range",
      axes: [
        { id: "length", label: "Length", min: 0, max: 20, unit: "mm" },
        { id: "width", label: "Width", min: 0, max: 20, unit: "mm" },
        { id: "depth", label: "Depth", min: 0, max: 10, unit: "mm" },
      ],
    };
    const value = {
      length: { min: 5, max: 10 },
      width: { min: 5, max: 10 },
      depth: { min: 2, max: 4 },
    };
    expect(formatFilterChipValue(def, value)).toBe(
      "L 5mm\u201310mm, W 5mm\u201310mm +1 more"
    );
  });
});
