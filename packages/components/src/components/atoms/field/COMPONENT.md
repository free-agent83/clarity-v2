---
name: Field
slug: field
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-field--default"
description: "Field composes label, control, description, and validation text."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Field to standardize form semantics and spacing around inputs/selects/controls. Prefer Field when a control needs helper text, error text, or required/optional affordances.

## Best practices

- Keep one primary label per control.
- Use description for help text and error slot for actionable validation.
- Avoid custom spacing wrappers that break field rhythm across forms.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values