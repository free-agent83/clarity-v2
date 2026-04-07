import { describe, it, expect } from "vitest";
import { dtcgToOklchString, toHex } from "../lib/color.mjs";
import { resolveRefs } from "../lib/resolve.mjs";

describe("dtcgToOklchString", () => {
  it("converts structured DTCG color object to oklch string", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [1, 0, 0],
    });
    expect(result).toBe("oklch(1 0 0)");
  });

  it("includes alpha when not 1", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [1, 0, 0],
      alpha: 0.5,
    });
    expect(result).toBe("oklch(1 0 0 / 0.5)");
  });

  it("omits alpha when 1", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [0.985, 0.002, 107],
      alpha: 1,
    });
    expect(result).toBe("oklch(0.985 0.002 107)");
  });
});

describe("toHex", () => {
  it("converts DTCG structured object to hex", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [1, 0, 0],
      hex: "#ffffff",
    });
    expect(result).toBe("#ffffff");
  });

  it("uses hex fallback when available", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [0.985, 0.002, 107],
      hex: "#fafaf9",
    });
    expect(result).toBe("#fafaf9");
  });

  it("converts oklch to hex when no fallback", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [1, 0, 0],
    });
    expect(result).toBe("#ffffff");
  });
});

describe("resolveRefs", () => {
  it("resolves a simple reference", () => {
    const tokens = {
      color: {
        primitive: {
          white: { $value: "#ffffff" },
        },
        semantic: {
          background: { $value: "{color.primitive.white}" },
        },
      },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.color.semantic.background.$value).toBe("#ffffff");
  });

  it("resolves nested references", () => {
    const tokens = {
      a: { $value: "{b}" },
      b: { $value: "{c}" },
      c: { $value: "final" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.a.$value).toBe("final");
  });

  it("resolves references in DTCG structured color objects", () => {
    const tokens = {
      color: {
        primitive: {
          white: {
            $value: { colorSpace: "oklch", components: [1, 0, 0], hex: "#ffffff" },
          },
        },
      },
      shadcn: {
        background: { $value: "{color.primitive.white}" },
      },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.shadcn.background.$value).toEqual({
      colorSpace: "oklch",
      components: [1, 0, 0],
      hex: "#ffffff",
    });
  });

  it("leaves non-reference values untouched", () => {
    const tokens = {
      spacing: { $value: "4px" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.spacing.$value).toBe("4px");
  });

  it("leaves OKLCH string values untouched", () => {
    const tokens = {
      border: { $value: "oklch(1 0 0 / 0.1)" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.border.$value).toBe("oklch(1 0 0 / 0.1)");
  });

  it("throws on missing reference", () => {
    const tokens = {
      a: { $value: "{does.not.exist}" },
    };
    expect(() => resolveRefs(tokens)).toThrow("does.not.exist");
  });

  it("throws on circular reference", () => {
    const tokens = {
      a: { $value: "{b}" },
      b: { $value: "{a}" },
    };
    expect(() => resolveRefs(tokens)).toThrow();
  });
});
