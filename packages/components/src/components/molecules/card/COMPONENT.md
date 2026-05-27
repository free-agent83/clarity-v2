---
name: Card
slug: card
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-card--default"
description: "Card groups related content and actions into a single surface."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Card for modular content blocks that need shared padding, border, and hierarchy. Do not use Card when the layout needs full-bleed page structure.

## Best practices

- Keep one primary message per card.
- Use CardHeader/CardContent/CardFooter consistently for predictable scans.
- Avoid nesting cards unless the interaction model clearly demands it.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values