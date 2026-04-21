---
name: PlpListContainer
slug: plp-list-container
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpListContainer

Table shell for PLP list view. Provides the scroll container, sticky header positioning, and `<thead>` / `<tbody>` scaffolding. Consumer provides the header row and body rows as pre-rendered nodes.

When `loading` is true, renders `skeletonCount` generic single-cell skeleton rows that span the full width regardless of column count.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | A single `PlpListHeaderRow` with `PlpListHeaderCell` children |
| `children` | `ReactNode` | — | List rows (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton row count |

## Quality checklist

- [x] Accessibility: table semantics, sticky header in the viewport
- [x] Tokens only: no hardcoded visual values
