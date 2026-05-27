---
name: Kbd
slug: kbd
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-kbd--default"
description: "Kbd styles keyboard key labels in instructional copy."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Kbd inline when documenting shortcuts or key sequences. It is presentational and should accompany plain-language instruction.

## Best practices

- Keep key labels platform-appropriate and consistent.
- Prefer short combinations over long chords in visible UI.
- Include textual fallback where shortcut semantics may be unclear.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values