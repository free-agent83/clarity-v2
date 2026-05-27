---
name: Drawer
slug: drawer
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "overlays-drawer--default"
description: "Drawer presents contextual content in a slide-in panel."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Drawer for secondary workflows that should retain page context while providing more space than a popover.

## Best practices

- Keep entry/exit transitions fast and reversible.
- Maintain clear close affordance and escape-key support.
- Avoid deeply nested workflows inside a single drawer.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values