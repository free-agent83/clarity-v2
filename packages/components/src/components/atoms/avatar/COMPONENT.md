---
name: Avatar
slug: avatar
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "display-avatar--default"
description: "Avatar surfaces identity using an image or fallback initials."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Avatar for people or account identity in list rows, headers, and message-like UI. Use initials/fallback when no image is available so layout stays stable.

## Best practices

- Keep avatar size consistent within a single surface.
- Always provide meaningful alt/fallback context where identity matters.
- Do not use Avatar as the only status indicator; pair with text or Badge when needed.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values