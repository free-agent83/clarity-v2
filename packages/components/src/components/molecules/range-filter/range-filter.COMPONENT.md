---
name: RangeFilter
slug: range-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# RangeFilter

One or more numeric range axes, each with a two-thumb slider, commit-on-blur numeric inputs, and an optional distribution histogram behind the slider.

Value is always `Record<string, { min; max }>` keyed by axis id, or `undefined`. Axes at their full range are omitted from the value; emptying all axes collapses the value to `undefined`.

Single-axis use: pass one axis with no `label`. The heading is skipped and `Min` / `Max` input labels appear for clarity.

Multi-axis use: pass multiple axes each with a `label`. Per-axis heading replaces the Min/Max input labels; a dash separates the two inputs.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Record<string, {min;max}> \| undefined` | — | Engaged axes keyed by id |
| `onChange` | `(value) => void` | — | Called when any axis commits |
| `axes` | `RangeAxis[]` | — | Axis definitions |

### RangeAxis

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Axis key (becomes a key in the filter value) |
| `label` | `string \| undefined` | Per-axis heading. Omit for single-axis to skip. |
| `min` / `max` | `number` | Axis bounds |
| `step` | `number` | Slider step (default 1) |
| `unit` | `string \| undefined` | Currency symbols prefix; others suffix |
| `histogram` | `RangeHistogram \| undefined` | Distribution bars behind the slider |

## Quality checklist

- [x] Accessibility: labelled inputs, keyboard-operable slider
- [x] Tokens only: no hardcoded visual values
