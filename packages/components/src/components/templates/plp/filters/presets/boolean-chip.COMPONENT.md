---
name: BooleanChipFilter
slug: plp-boolean-chip-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# BooleanChipFilter

On/off filter preset rendered as a `Switch` + `Label`. Value is strictly `true` (active) or `undefined` (cleared) — no `false` — so presence tracks the same way as every other preset.

Used inside a `PlpQuickFilter` for the toolbar row, or directly inside a `PlpFilterSection` for the drawer.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `true \| undefined` | — | Active when `true`, cleared when `undefined` |
| `onChange` | `(value: true \| undefined) => void` | — | Called on switch toggle |
| `label` | `string` | — | Shown next to the switch |

## Quality checklist

- [x] Accessibility: label-for-switch association, keyboard togglable
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
