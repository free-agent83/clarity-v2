---
name: SingleSelectChipsFilter
slug: plp-single-select-chips-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# SingleSelectChipsFilter

Mutually exclusive chip group. Only one option can be pressed at a time; clicking an already-pressed option clears the filter. Each option is an independent `Toggle` so `renderOption` can drive rich layouts (card-shaped selectors etc.).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | — | The value of the selected option, or `undefined` when cleared |
| `onChange` | `(value: string \| undefined) => void` | — | Called when the selection changes |
| `options` | `SingleSelectChipOption[]` | — | Options (value, label, optional adornment, optional `renderOption`) |

### SingleSelectChipOption

| Field | Type | Description |
|-------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `adornment` | `ReactNode \| undefined` | Small visual before the label (colour swatch, icon) |
| `renderOption` | `(props: { selected: boolean }) => ReactNode` | Overrides the default toggle content entirely |

## Quality checklist

- [x] Accessibility: keyboard-operable toggles, aria-label
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
