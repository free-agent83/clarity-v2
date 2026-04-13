---
name: Item
slug: item
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Item

A generic layout primitive for rendering list-like item rows with consistent alignment, gap, and padding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes |
| `children` | `React.ReactNode` | — | Item content |

Extends all native `<div>` HTML attributes.

## Usage guidelines

Use Item as a lightweight layout wrapper for rows inside lists, menus, settings panels, or any grouped content where items share a consistent row layout.

Do not use Item for complex, interactive list entries that need their own state or keyboard navigation — use a more specialised molecule instead.

## Best practices

**Do:** Compose Item with icons, text, and actions as children for consistent row layout.

**Do:** Override spacing with `className` when the default gap/padding doesn't suit the context.

**Don't:** Use Item as a standalone display component — it is a layout building block, not a semantic element.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
