---
name: DataTable
slug: data-table
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# DataTable

A placeholder for a full-featured data table built on @tanstack/react-table and the Table molecule.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Custom content; falls back to placeholder text when omitted |

## Usage guidelines

Use DataTable when you need a table with sorting, filtering, pagination, or row selection. For simple static tables, use the Table molecule directly.

This component is currently a placeholder. The full implementation will integrate @tanstack/react-table to provide:

- Column sorting
- Filtering and search
- Pagination
- Row selection
- Column visibility toggling

## Best practices

**Do:** Use DataTable for datasets that benefit from interactive controls (sort, filter, paginate).

**Don't:** Use DataTable for simple, small, static tables — use Table instead.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
