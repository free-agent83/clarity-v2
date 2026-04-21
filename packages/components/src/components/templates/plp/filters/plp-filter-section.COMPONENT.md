---
name: PlpFilterSection
slug: plp-filter-section
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpFilterSection

Thin wrapper for a single filter entry inside a `PlpFilterDrawer`. Renders a leading separator, a heading, and the filter control. Exists so consumers don't have to re-implement the per-section scaffold for every drawer they render.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Section heading shown above the control |
| `children` | `ReactNode` | — | The filter control |
| `separator` | `boolean` | `true` | When `false`, suppresses the leading separator — typically set on the first section of a drawer |

## Quality checklist

- [x] Accessibility: semantic heading per section
- [x] Tokens only: no hardcoded visual values
