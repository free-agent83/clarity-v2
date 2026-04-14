---
name: Separator
slug: separator
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Separator

Visual divider between groups of related content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis of the separator. |
| `decorative` | `boolean` | `true` | When `false`, the separator is announced to assistive technology as a semantic divider. When `true`, it is hidden from the accessibility tree. |

All standard HTML attributes for the root `<div>` are supported via prop spread.

## Usage guidelines

Use Separator to visually group related content into sections — inside menus, between list items, or between distinct regions of a page. A Separator is a lightweight alternative to wrapping content in a bordered container.

**Don't use Separator** as a substitute for whitespace. If the only goal is to add breathing room between elements, use spacing utilities or layout gaps instead.

## Best practices

- **Do:** Use `orientation="vertical"` inside horizontal layouts (toolbars, button groups) where a horizontal line would break the flow.
- **Do:** Pass `decorative={false}` when the separator carries semantic meaning — for example, between a menu's destructive action and its other items.
- **Don't:** Add a border to a container *and* a Separator inside it — pick one.
- **Don't:** Use a Separator as a fake heading. If content needs a label, use a real heading element.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: no breakpoint-dependent behaviour
- [x] Tokens only: no raw literals inside arbitrary value syntax
