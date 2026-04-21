---
name: PlpGridContainer
slug: plp-grid-container
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpGridContainer

Responsive 2/3/4-column grid wrapper for PLP cards.

When `loading` is true, renders a grid of skeleton cards tuned to the default `PlpGridItem` card proportions (aspect-square image placeholder, name + caption lines, badges, delivery/returns/price lines). When false, renders `children`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Grid cards (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton card count |

## Quality checklist

- [x] Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- [x] Tokens only: no hardcoded visual values
