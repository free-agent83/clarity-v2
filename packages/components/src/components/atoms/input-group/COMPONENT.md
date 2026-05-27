---
name: InputGroup
slug: input-group
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-inputgroup--default"
description: "InputGroup composes text inputs with inline leading/trailing elements."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use InputGroup when an input needs contextual prefix/suffix UI (icons, units, static text, actions) inside a single visual control.

## Best practices

- Keep inline addons short and non-blocking.
- Preserve input focus behavior and keyboard interaction for appended actions.
- Prefer InputGroup over ad-hoc flex wrappers for consistent radius and borders.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values