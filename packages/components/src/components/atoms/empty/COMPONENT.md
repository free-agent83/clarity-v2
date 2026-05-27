---
name: Empty
slug: empty
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "feedback-empty--default"
description: "Empty provides structured empty-state messaging with actions."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Empty when a surface has no data, no results, or no configured content. It should explain the state and provide the next action.

## Best practices

- Include a clear title, short context line, and one primary action.
- Reference active filters/search criteria when relevant.
- Keep empty-state height and spacing close to the populated layout to reduce visual jump.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values