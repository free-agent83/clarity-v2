---
name: NavigationMenu
slug: navigation-menu
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "navigation-navigationmenu--default"
description: "NavigationMenu exposes grouped navigation destinations and submenus."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use NavigationMenu for site/app-level navigation clusters where hierarchy and discoverability are important.

## Best practices

- Keep group labels stable and predictable.
- Limit submenu depth to preserve scanability.
- Ensure pointer and keyboard users can reach all paths equivalently.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values