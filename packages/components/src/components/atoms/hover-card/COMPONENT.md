---
name: HoverCard
slug: hover-card
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "overlays-hovercard--default"
description: "HoverCard reveals supporting information on hover or focus."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use HoverCard for supplemental, non-blocking context tied to an anchor element. Do not use it for critical actions or mandatory content.

## Best practices

- Keep content concise and scannable.
- Ensure the same information is available via keyboard focus, not hover-only.
- Prefer Tooltip for one-line hints; use HoverCard for richer detail.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values