---
name: FilterDrawer
slug: filter-drawer
version: 0.2.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterDrawer

Left-side Sheet container for a filter list, plus the trigger button that opens it and the section wrapper used inside its body. All three exports live in this one module because they are designed to be used together — a trigger without a drawer and a section without a drawer are both meaningless in isolation.

## Exports

| Export | Role |
|--------|------|
| `FilterDrawer` | The Sheet container: header with optional Clear, scrollable body, sticky footer with results-count-aware primary action |
| `FilterDrawerTrigger` | Outline "All filters" button with optional active-count badge. Fires a consumer-provided `onClick` that flips drawer open state |
| `FilterSection` | Heading + optional leading separator + control wrapper for each entry inside the drawer body |

The drawer holds no draft state itself — consumers own applied and draft filter state, compose preset controls inside `FilterSection` wrappers, and commit via `onApply`.

## FilterDrawer props

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

## FilterDrawerTrigger props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeFilterCount` | `number` | — | Number shown in the badge. Badge hidden when `0`. |
| `onClick` | `() => void` | — | Handler for the button click. Typically opens the drawer. |

## FilterSection props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Section heading shown above the control |
| `children` | `ReactNode` | — | The filter control |
| `separator` | `boolean` | `true` | Leading separator. Set `false` on the first section of a drawer. |

## Quality checklist

- [x] Accessibility: delegates to the Sheet molecule's focus trap and aria-label; semantic heading per section
- [x] Tokens only: no hardcoded visual values
