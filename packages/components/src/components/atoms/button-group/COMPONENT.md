---
name: ButtonGroup
slug: button-group
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "actions-buttongroup--default"
description: "ButtonGroup arranges related buttons with shared alignment and spacing."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use ButtonGroup for tightly related actions that should be scanned as a set. Do not group unrelated actions just for visual compactness.

## Best practices

- Keep action count small to reduce decision fatigue.
- Order actions by importance left-to-right in LTR layouts.
- Ensure each grouped button still has a clear standalone label.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values