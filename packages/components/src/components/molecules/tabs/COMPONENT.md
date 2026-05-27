---
name: Tabs
slug: tabs
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "navigation-tabs--default"
description: "Tabs switch between peer content sections within the same context."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Tabs when users need to switch between related panels without navigation. Use routing instead when tab choices should be deep-linkable pages.

## Best practices

- Keep tab labels short and parallel.
- Ensure each tab panel has meaningful heading/context for assistive tech.
- Do not overload tabs with mixed hierarchy (peer sections only).

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values