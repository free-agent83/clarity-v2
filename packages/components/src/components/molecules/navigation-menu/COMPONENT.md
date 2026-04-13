---
name: NavigationMenu
slug: navigation-menu
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Navigation Menu

A collection of links for navigating websites, with support for dropdown content panels. Built on Radix UI Navigation Menu primitive.

## Props

### NavigationMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewport` | `boolean` | `true` | Whether to render the shared viewport container for content panels |

### NavigationMenuTrigger

Renders a button that toggles the visibility of a `NavigationMenuContent` panel.

### NavigationMenuContent

Renders the dropdown content panel associated with a trigger. Supports enter/exit animations.

### NavigationMenuLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | The URL to navigate to |

## Usage guidelines

Use Navigation Menu for site-level or section-level navigation with rich dropdown content panels. Ideal for top-level navigation bars where categories have sub-pages.

Do not use Navigation Menu for simple link lists — use a plain list of links. Do not use it inside sidebars — use the Sidebar component instead.

## Best practices

**Do:** Keep the number of top-level menu items to 5-7 for scannability.

**Do:** Use `NavigationMenuLink` for items within content panels — it handles focus management correctly.

**Don't:** Put complex interactive content (forms, data tables) inside navigation menu panels.

**Don't:** Mix Navigation Menu with other navigation patterns in the same region.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
