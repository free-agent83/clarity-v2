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

// ─── Integration tests for build.mjs ───

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("build.mjs integration", () => {
  const dist = join(import.meta.dirname, "..", "dist");

  it("builds without errors", () => {
    execSync("node build.mjs", {
      cwd: join(import.meta.dirname, ".."),
      stdio: "pipe",
    });
  });

  it("produces dist/web/tokens.css with OKLCH values", () => {
    const css = readFileSync(join(dist, "web/tokens.css"), "utf-8");
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primitive-white:");
    expect(css).toContain("oklch(");
    expect(css).toContain("--color-semantic-background-default:");
    expect(css).toContain("--spacing-4:");
    expect(css).toContain("--font-size-base:");
    expect(css).toContain("--radius-lg:");
    expect(css).toContain("--shadow-md:");
  });

  it("produces dist/js/tokens.js with ES6 exports", () => {
    const js = readFileSync(join(dist, "js/tokens.js"), "utf-8");
    expect(js).toContain("export const");
    expect(js).toContain("ColorPrimitiveWhite");
    expect(js).toMatch(/Spacing[A-Z0-9]/);
  });

  it("produces dist/js/tokens.d.ts", () => {
    expect(existsSync(join(dist, "js/tokens.d.ts"))).toBe(true);
  });

  it("produces dist/react-native/tokens.js with hex values", () => {
    const js = readFileSync(join(dist, "react-native/tokens.js"), "utf-8");
    expect(js).toContain("export const");
    expect(js).toContain("#");
  });

  it("produces dist/json/tokens.json", () => {
    const json = JSON.parse(readFileSync(join(dist, "json/tokens.json"), "utf-8"));
    expect(json.color).toBeDefined();
    expect(json.spacing).toBeDefined();
  });
});
