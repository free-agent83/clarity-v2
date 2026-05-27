---
name: Toaster
slug: sonner
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "feedback-sonner--default"
description: "Sonner renders toast notifications for transient system feedback."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Sonner for non-blocking confirmation, warning, or status messages that should not interrupt flow.

## Best practices

- Keep toast copy brief and action-oriented.
- Use one primary action at most per toast.
- Do not use toasts for critical errors requiring immediate resolution.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values