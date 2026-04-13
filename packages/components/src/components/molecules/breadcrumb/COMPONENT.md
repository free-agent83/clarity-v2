---
name: Breadcrumb
slug: breadcrumb
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Breadcrumb

Displays a hierarchical navigation trail showing the user's current location within the application. Uses semantic `<nav>` and `<ol>` elements.

## Props

### Breadcrumb

Renders as a `<nav>` element with `aria-label="breadcrumb"`.

### BreadcrumbLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot (e.g. for Next.js Link) |
| `href` | `string` | — | The URL to navigate to |

### BreadcrumbPage

Renders the current page as an `aria-current="page"` span (not clickable).

### BreadcrumbSeparator

Renders a separator between breadcrumb items. Defaults to a chevron-right icon.

### BreadcrumbEllipsis

Renders an ellipsis indicator for collapsed breadcrumb items.

## Usage guidelines

Use Breadcrumb to show the user's position within a hierarchical page structure. Particularly useful in deeply nested views with 3+ levels of navigation.

Do not use Breadcrumb for flat site structures or single-level navigation. Do not use it as the only navigation mechanism — it supplements primary navigation, not replaces it.

## Best practices

**Do:** Always include the current page as the last item using `BreadcrumbPage`.

**Do:** Use `asChild` with Next.js `Link` for client-side navigation.

**Don't:** Include more than 5-6 levels — use `BreadcrumbEllipsis` to collapse intermediate levels.

**Don't:** Make the current page a clickable link.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
