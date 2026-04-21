// ── Chip-summary formatters ───────────────────────────────────────────
//
// Each filter has its own chip-summary shape; format helpers live here
// in the consumer. The library no longer ships a chip formatter.

import type { RangeAxis } from "../../../molecules/range-filter/range-filter";

export function formatMultiSelectChip(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
}

export function formatUnitValue(n: number, unit?: string): string {
  if (!unit) return String(n);
  const isPrefix =
    ["$", "€", "£", "¥"].some((c) => unit.startsWith(c)) ||
    ["USD", "EUR", "GBP", "JPY"].includes(unit);
  return isPrefix ? `${unit}${n}` : `${n}${unit}`;
}

export function formatRangeChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axisId: string,
  unit?: string
): string {
  const v = value?.[axisId];
  if (!v) return "";
  return `${formatUnitValue(v.min, unit)}\u2013${formatUnitValue(v.max, unit)}`;
}

export function formatMultiAxisChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axes: RangeAxis[]
): string {
  if (!value) return "";
  const segments: string[] = [];
  for (const axis of axes) {
    const v = value[axis.id];
    if (!v) continue;
    const abbrev = axis.label
      ? axis.label.charAt(0).toUpperCase()
      : axis.id.charAt(0).toUpperCase();
    segments.push(
      `${abbrev} ${formatUnitValue(v.min, axis.unit)}\u2013${formatUnitValue(v.max, axis.unit)}`
    );
  }
  if (segments.length === 0) return "";
  if (segments.length <= 2) return segments.join(", ");
  return `${segments[0]}, ${segments[1]} +${segments.length - 2} more`;
}

export function labelForValue(options: { value: string; label: string }[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v;
}
