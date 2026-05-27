---
name: AspectRatio
slug: aspect-ratio
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-aspectratio--default"
description: "AspectRatio preserves media layout proportions as containers resize."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use AspectRatio for images/video/media shells that must keep a stable ratio during responsive layout changes.

## Best practices

- Match ratio choice to content type (e.g., square product shots).
- Combine with object-fit rules to avoid unintended cropping.
- Keep skeleton/loading placeholders on the same ratio to prevent jumps.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values