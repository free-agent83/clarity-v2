---
name: Carousel
slug: carousel
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-carousel--default"
description: "Carousel displays a sequence of related items in a horizontal viewport."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Carousel for browsing peer content where horizontal progression is expected. Avoid it for essential information that must be seen immediately.

## Best practices

- Keep slide widths and snap behavior predictable.
- Provide visible controls and keyboard navigation.
- Avoid auto-advance for transactional content; user control first.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values