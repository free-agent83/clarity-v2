---
name: AlertDialog
slug: alert-dialog
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "overlays-alertdialog--default"
description: "AlertDialog confirms high-risk actions before irreversible outcomes."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use AlertDialog for destructive or high-impact operations that require explicit acknowledgement before proceeding.

## Best practices

- Keep title and description specific to the exact consequence.
- Use destructive styling only on the irreversible action button.
- Provide a safe cancel path with clear focus default.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values