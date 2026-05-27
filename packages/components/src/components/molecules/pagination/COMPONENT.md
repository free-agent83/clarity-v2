---
name: Pagination
slug: pagination
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "navigation-pagination--default"
description: "Pagination controls navigation through large, ordered result sets."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Pagination for list/table/grid results that are split into pages. Prefer infinite loading only where continuous browsing is measurably better.

## Best practices

- Show current page clearly and keep controls predictable.
- Pair with result count and page size context where possible.
- Keep URL/state in sync so paging is shareable and back-button friendly.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values