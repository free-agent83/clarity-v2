---
name: AspectRatio
slug: aspect-ratio
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Aspect Ratio

A container that maintains a specified width-to-height ratio for its content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ratio` | `number` | `1` | The desired width-to-height ratio (e.g. `16 / 9`) |
| `children` | `ReactNode` | — | Content to display within the ratio container |

## Usage guidelines

Use AspectRatio to display images, videos, or maps at consistent proportions regardless of container width.

Do not use AspectRatio for text-heavy content — the fixed ratio may clip or create awkward layouts.

## Best practices

**Do:** Use `16 / 9` for video content and hero images.

**Do:** Use `1` (square) for avatar-like or thumbnail content.

**Don't:** Use arbitrary ratios without a design rationale. Stick to standard ratios: 1:1, 4:3, 16:9.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
