---
name: AsyncComboboxFilter
slug: async-combobox-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# AsyncComboboxFilter

Multi-select combobox with lazily-loaded options. `searchFn` is invoked once with an empty query when the popover first opens, then on each debounced keystroke.

Selection state is a fully controlled `Option[]` on the consumer side. The component never caches selections internally — labels are retained across query changes because the caller always holds the `Option` objects. Consumers format chip summaries directly from the value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `AsyncComboboxOption[] \| undefined` | — | Selected options (full objects, not just values) |
| `onChange` | `(value) => void` | — | Called when selection changes; receives full `Option[]` or `undefined` |
| `searchFn` | `(query: string) => Promise<Option[]>` | — | Option loader invoked on open and on each debounced query change |
| `searchDebounceMs` | `number` | `250` | Debounce delay between keystrokes and search calls |
| `searchPlaceholder` | `string \| undefined` | `"Search..."` | Placeholder when no options are selected |

### AsyncComboboxOption

| Field | Type | Description |
|-------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `adornment` | `ReactNode \| undefined` | Small visual before the label |

## Quality checklist

- [x] Accessibility: delegates to the Combobox molecule's a11y
- [x] Tokens only: no hardcoded visual values
