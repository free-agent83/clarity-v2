---
name: FilterDrawer
slug: filter-drawer
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterDrawer

Left-side Sheet container for a filter list. Renders the shell, an optional header Clear action, a scrollable body that flows consumer-composed filter sections, and a sticky footer with a results-count-aware primary action.

The drawer holds no draft state itself — consumers own applied and draft filter state, compose preset controls inside `FilterSection` wrappers, and commit via `onApply`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open-state setter |
| `onApply` | `() => void` | — | Fires on primary-action click. Consumer commits draft and typically closes the drawer. |
| `onClearDraft` | `() => void` | — | Fires on header Clear click. Only rendered when `hasActiveDraft` and `onClearDraft` are both set. |
| `hasActiveDraft` | `boolean` | `false` | Gates the header Clear action. |
| `resultsCount` | `number` | — | When set, primary action reads `"Show X results"`. |
| `isCountLoading` | `boolean` | `false` | Primary action shows a spinner and disables while a preview-count fetch is in flight. |
| `applyLabel` | `string` | `"Apply"` | Primary action text when `resultsCount` is undefined. |
| `children` | `ReactNode` | — | Filter sections (usually `FilterSection` wrappers). |

## Quality checklist

- [x] Accessibility: delegates to the Sheet molecule's focus trap and aria-label
- [x] Tokens only: no hardcoded visual values
