---
name: MultiAxisRangeFilter
slug: plp-multi-axis-range-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# MultiAxisRangeFilter

Several named ranges under one filter — one slider + numeric input pair per axis. Value is a record keyed by axis id. Axes at their full range are omitted from the value; clearing every axis collapses the value to `undefined`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Record<string, { min; max }> \| undefined` | — | Engaged axes keyed by id; full-range axes are omitted |
| `onChange` | `(value) => void` | — | Called when any axis commits |
| `axes` | `MultiAxisRangeAxis[]` | — | Axis definitions |

### MultiAxisRangeAxis

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Machine-readable axis key (becomes a key in the filter value) |
| `label` | `string` | Human-readable axis heading shown in the UI and in chip text |
| `min` | `number` | Lower bound of this axis |
| `max` | `number` | Upper bound of this axis |
| `step` | `number \| undefined` | Increment between slider stops (defaults to 1) |
| `unit` | `string \| undefined` | Unit label shown as a suffix on inputs |

## Quality checklist

- [x] Accessibility: labelled inputs per axis, keyboard-operable sliders
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
