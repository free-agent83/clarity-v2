---
name: SidebarProvider
slug: sidebar
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "navigation-sidebar--default"
description: "Sidebar provides persistent navigation and context for multi-section flows."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Sidebar for primary app navigation and grouped destinations. Keep item hierarchy shallow and labels stable across sessions.

## Best practices

- Keep navigation labels short and noun-based.
- Reserve badges/counters for high-signal status only.
- Validate collapsed and mobile states for parity of access.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values