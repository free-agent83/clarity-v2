---
name: Collapsible
slug: collapsible
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-collapsible--default"
description: "Collapsible toggles visibility of inline content regions."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Collapsible for compact disclosure of secondary details within a flow. Prefer Accordion when you have multiple peer sections.

## Best practices

- Keep trigger labels explicit about hidden content.
- Preserve focus order when content opens/closes.
- Avoid nesting collapsibles unless interaction is tested thoroughly.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values