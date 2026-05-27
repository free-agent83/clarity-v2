---
name: Item
slug: item
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-item--default"
description: "Item composes media, text, and actions into a reusable list row pattern."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Item for repeatable row/list content where structure should remain consistent across states (default, interactive, selected).

## Best practices

- Keep primary text and metadata hierarchy consistent between rows.
- Use Item actions for contextual row-level operations only.
- Avoid overloading rows with too many trailing controls.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values