---
name: Table
slug: table
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "data-table--default"
description: "Table presents dense, comparable data in rows and columns."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Table when users need to scan, compare, or sort structured records. For single-item summaries, prefer Card/List patterns.

## Best practices

- Keep columns purposeful; remove low-signal fields.
- Right-align numeric values and keep units/currency consistent.
- Preserve header context and row focus styles for keyboard users.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values