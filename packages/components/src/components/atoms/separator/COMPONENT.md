---
name: Separator
slug: separator
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Separator

A visual divider between content sections, rendered as a horizontal or vertical line.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the separator |
| `decorative` | `boolean` | `true` | When true, the separator is purely visual and hidden from assistive technology |
| `className` | `string` | — | Additional CSS classes |

## Usage guidelines

Use Separator to create visual breaks between sections of content, menu items, or inline elements.

Do not use Separator for layout spacing. Use Tailwind spacing utilities instead.

## Best practices

**Do:** Use horizontal separators between stacked content sections.

**Do:** Use vertical separators between inline items (e.g. breadcrumbs, toolbar buttons).

**Don't:** Overuse separators — white space is often a better divider.

**Don't:** Set `decorative={false}` unless the separator conveys meaningful structure to screen readers.

## Figma

<!-- TODO: Add Figma component link once DSW-Web-Components is published -->

## Design-match record

<!-- Placeholder — to be filled once Figma source is available -->

| Criterion | Status | Notes |
|-----------|--------|-------|
| Colour | — | Uses `bg-border` token |
| Thickness | — | 1px (h-px / w-px) |
| Spacing | — | Consumer-controlled via className |

## Quality checklist

- [x] Accessibility: decorative by default, `role="separator"` when non-decorative (Radix handles this)
- [ ] Figma parity: pending Figma component publish
- [x] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values
