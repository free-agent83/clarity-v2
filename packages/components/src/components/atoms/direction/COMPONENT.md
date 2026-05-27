---
name: DirectionProvider
slug: direction
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "foundations-direction--default"
description: "Direction sets reading direction context (LTR/RTL) for descendant UI."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Direction to scope bidirectional behavior for localized surfaces and validate mirrored layout interactions.

## Best practices

- Apply direction at meaningful layout boundaries.
- Verify icon alignment and chevron orientation under RTL.
- Test keyboard navigation order in both LTR and RTL modes.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values