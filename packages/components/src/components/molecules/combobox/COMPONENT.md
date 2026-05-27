---
name: Combobox
slug: combobox
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-combobox--default"
description: "Combobox combines text search and option selection in one control."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Combobox when option sets are too large for a simple Select or when users benefit from type-to-find behavior.

## Best practices

- Use clear placeholder text describing what can be searched.
- Keep option labels unambiguous and stable over time.
- For async sources, debounce queries and show loading/empty states explicitly.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values