---
name: Accordion
slug: accordion
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "navigation-accordion--default"
description: "Accordion expands and collapses sections of related content."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Accordion when content can be grouped into independent sections and users benefit from progressive disclosure.

## Best practices

- Write clear, question-like or noun-based section triggers.
- Do not hide critical validation or mandatory information by default.
- Keep panel content concise to reduce scrolling inside long accordions.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values