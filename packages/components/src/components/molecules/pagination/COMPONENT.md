---
name: Pagination
slug: pagination
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Pagination

Navigation controls for moving between pages of content. Uses semantic `<nav>` with `aria-label="pagination"`.

## Props

### PaginationLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | `boolean` | `false` | Whether this page is the current page |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | Button size from the Button variant system |
| `href` | `string` | — | The URL for this page |

### PaginationPrevious / PaginationNext

Renders a previous/next navigation link with chevron icon and label text.

### PaginationEllipsis

Renders an ellipsis indicator for skipped page ranges.

## Usage guidelines

Use Pagination when content is split across multiple pages and users need to navigate between them. Typical for search results, data tables, and listing pages.

Do not use Pagination for infinite scroll content. Do not use it when the total page count is 1 — hide pagination entirely.

## Best practices

**Do:** Show the current page number as visually active using `isActive`.

**Do:** Always include Previous and Next links for keyboard and screen reader users.

**Don't:** Show more than 5-7 page numbers at once — use `PaginationEllipsis` to collapse ranges.

**Don't:** Disable Previous on the first page or Next on the last page — hide them or make them non-interactive.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
