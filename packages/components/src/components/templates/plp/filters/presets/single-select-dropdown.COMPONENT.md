---
name: SingleSelectDropdownFilter
slug: plp-single-select-dropdown-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# SingleSelectDropdownFilter

Dropdown filter using the design system `Select` molecule. Used when the option list is too long for chips or when free-text search within the dropdown helps discovery.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | — | Selected option value, or `undefined` when cleared |
| `onChange` | `(value: string \| undefined) => void` | — | Called when selection changes |
| `options` | `SingleSelectDropdownOption[]` | — | Options (value, label, optional adornment) |
| `placeholder` | `string` | `"Select..."` | Trigger placeholder when no option is selected |

### SingleSelectDropdownOption

| Field | Type | Description |
|-------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `adornment` | `ReactNode \| undefined` | Small visual before the label |

## Quality checklist

- [x] Accessibility: delegates to the Select molecule's a11y
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
