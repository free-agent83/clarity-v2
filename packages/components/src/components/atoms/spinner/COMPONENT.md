---
name: Spinner
slug: spinner
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "feedback-spinner--default"
description: "Spinner indicates an in-progress action with indeterminate duration."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Spinner for local action feedback (button submit, inline operation). Prefer Skeleton for page/section content loading.

## Best practices

- Scope spinner placement to the affected UI region.
- Pair with status text when operations exceed a brief wait.
- Avoid full-page spinner-only states for content retrieval flows.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values