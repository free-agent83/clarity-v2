---
name: MultiSelectChipsFilter
slug: plp-multi-select-chips-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# MultiSelectChipsFilter

Chip group with any-number-of-selections semantics. Clicking an option toggles its presence in the selected array. When the selection empties, the value collapses to `undefined` so consumers can treat "filter not engaged" uniformly across presets. Each option is an independent `Toggle` so `renderOption` can drive rich layouts (card-shaped selectors etc.).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[] \| undefined` | — | Selected values, or `undefined` when no option is selected |
| `onChange` | `(value: string[] \| undefined) => void` | — | Called when selection changes |
| `options` | `MultiSelectChipOption[]` | — | Options (value, label, optional adornment, optional `renderOption`) |

### MultiSelectChipOption

Same shape as `SingleSelectChipOption`: `{ value, label, adornment?, renderOption? }`. Declared independently per preset (no shared `FilterOption` type).

## Quality checklist

- [x] Accessibility: keyboard-operable toggles, aria-label
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
