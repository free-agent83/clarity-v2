---
name: PlpHeading
slug: plp-heading
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpHeading

Heading region for a PLP page — breadcrumbs, category title (H1), and results count. Results count uses `aria-live="polite"` so screen readers announce when filters or pagination change it.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb segments. The last is rendered as the current page. |
| `title` | `string` | — | Category title (H1) |
| `resultsCount` | `number` | — | Total result count |

## Quality checklist

- [x] Accessibility: semantic H1, aria-live on count, breadcrumb semantics
- [x] Tokens only: no hardcoded visual values
