---
name: AllFiltersButton
slug: all-filters-button
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# AllFiltersButton

Outline button with an adjustments icon and optional active-count badge. Opens a filter drawer when clicked. Designed to sit in both the main and sticky variants of `FilterToolbar`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeFilterCount` | `number` | — | Number shown in the badge. Badge hidden when `0`. |
| `onClick` | `() => void` | — | Handler for the button click. Typically opens a `FilterDrawer`. |

## Quality checklist

- [x] Accessibility: keyboard-operable button
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
