---
name: Toggle
slug: toggle
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-toggle--default"
description: "Toggle switches between two persistent states for a control option."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Toggle for on/off or selected/unselected control states where immediate state visibility matters.

## Best practices

- Label toggles with clear stateful language.
- Ensure pressed/unpressed styles remain distinguishable in both themes.
- Prefer Switch when semantics are specifically binary setting controls.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values