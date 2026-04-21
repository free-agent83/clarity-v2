---
name: FilterSection
slug: filter-section
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterSection

Thin wrapper for a single filter entry inside a `FilterDrawer`. Renders an optional leading separator, a heading, and the filter control.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Section heading shown above the control |
| `children` | `ReactNode` | — | The filter control |
| `separator` | `boolean` | `true` | Leading separator. Set `false` on the first section of a drawer. |

## Quality checklist

- [x] Accessibility: semantic heading per section
- [x] Tokens only: no hardcoded visual values
