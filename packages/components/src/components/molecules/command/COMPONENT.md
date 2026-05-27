---
name: Command
slug: command
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "actions-command--default"
description: "Command provides searchable action/result lists for quick navigation."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Command for command palette patterns and high-speed option search. It is best for keyboard-first power interactions.

## Best practices

- Group commands with clear headings and concise labels.
- Keep result text specific so filtering remains useful.
- Always support keyboard selection and clear empty-search feedback.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values