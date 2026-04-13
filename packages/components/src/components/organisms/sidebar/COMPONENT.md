---
name: Sidebar
slug: sidebar
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Sidebar

A complex application-level navigation component with collapsible state, mobile responsiveness, and nested menu structure. Composes Button, Input, Separator, Sheet, Skeleton, and Tooltip internally.

## Props

### SidebarProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `true` | Initial open state |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |

### Sidebar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `"left" \| "right"` | `"left"` | Which side of the viewport the sidebar appears on |
| `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` | Visual style of the sidebar |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | Collapse behaviour |

### SidebarMenuButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot |
| `isActive` | `boolean` | `false` | Whether this menu item is currently active |
| `variant` | `"default" \| "outline"` | `"default"` | Visual style |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Button size |
| `tooltip` | `string \| TooltipContentProps` | — | Tooltip content shown when sidebar is collapsed |

### useSidebar

Hook that returns the sidebar context: `state`, `open`, `setOpen`, `isMobile`, `openMobile`, `setOpenMobile`, `toggleSidebar`. Must be used within `SidebarProvider`.

## Usage guidelines

Use Sidebar for application-level navigation in dashboard-style layouts. It handles responsive behaviour automatically — rendering as a Sheet on mobile and a collapsible panel on desktop.

Do not use Sidebar for simple page-level navigation — use Tabs or Navigation Menu. Do not use it in marketing or content pages where the full viewport width is needed.

## Best practices

**Do:** Wrap the entire app layout in `SidebarProvider` at the top level.

**Do:** Use `SidebarInset` for the main content area to get correct layout spacing.

**Do:** Use `SidebarMenuButton` with `tooltip` prop for icon-only collapsed state.

**Don't:** Nest `SidebarProvider` inside another `SidebarProvider`.

**Don't:** Use more than 2-3 levels of nesting — deep hierarchies should be flattened or moved to sub-pages.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
