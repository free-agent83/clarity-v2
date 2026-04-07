import { formatHex } from "culori";

/**
 * Convert a DTCG structured color object to an oklch() CSS string.
 * @param {{ colorSpace: string, components: number[], alpha?: number }} value
 * @returns {string} e.g. "oklch(0.985 0.002 107)" or "oklch(1 0 0 / 0.5)"
 */
export function dtcgToOklchString(value) {
  const [l, c, h] = value.components;
  const base = `oklch(${l} ${c} ${h})`;
  if (value.alpha !== undefined && value.alpha !== 1) {
    return `oklch(${l} ${c} ${h} / ${value.alpha})`;
  }
  return base;
}

/**
 * Convert a DTCG structured color object to a hex string.
 * Uses the hex fallback if available, otherwise converts via culori.
 * @param {{ colorSpace: string, components: number[], hex?: string }} value
 * @returns {string} e.g. "#ffffff"
 */
export function toHex(value) {
  if (value.hex) return value.hex;
  const [l, c, h] = value.components;
  return formatHex({ mode: "oklch", l, c, h });
}
