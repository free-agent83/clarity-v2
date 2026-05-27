---
name: ScrollArea
slug: scroll-area
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-scrollarea--default"
description: "ScrollArea provides styled overflow regions with consistent scroll affordance."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use ScrollArea when a bounded container needs independent scrolling without shifting page layout.

## Best practices

- Keep container height explicit to avoid accidental double scrollbars.
- Ensure keyboard and wheel/touch interactions remain natural.
- Avoid nesting multiple scroll regions unless necessary for UX.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values