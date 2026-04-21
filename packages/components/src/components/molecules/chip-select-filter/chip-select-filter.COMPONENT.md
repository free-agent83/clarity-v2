---
name: ChipSelectFilter
slug: chip-select-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# ChipSelectFilter

Chip group with either single-select or multi-select semantics, chosen via the `mode` prop.

- `mode: "single"` — mutually exclusive. Clicking an option replaces the selection; clicking an already-pressed option clears the filter.
- `mode: "multiple"` — toggles the option's presence in a selected array. Empty selection collapses to `undefined`.

Requires at least two options. Use a `Toggle` atom directly for single-option boolean filters.

## Props

Discriminated union on `mode`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"single" \| "multiple"` | — | Selection semantics. |
| `value` | `string \| undefined` (single) / `string[] \| undefined` (multiple) | — | Current selection. |
| `onChange` | `(v: string \| undefined) => void` (single) / `(v: string[] \| undefined) => void` (multiple) | — | Called on selection change. |
| `options` | `ChipSelectOption[]` | — | Options (value, label, optional adornment, optional `renderOption`). |

### ChipSelectOption

| Field | Type | Description |
|-------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `adornment` | `ReactNode \| undefined` | Small visual before the label |
| `renderOption` | `(props: { selected: boolean }) => ReactNode` | Overrides the default toggle content entirely |

## Quality checklist

- [x] Accessibility: keyboard-operable toggles, aria-label
- [x] Tokens only: no hardcoded visual values
