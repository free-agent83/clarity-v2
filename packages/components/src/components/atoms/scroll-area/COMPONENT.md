---
name: ScrollArea
slug: scroll-area
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Scroll Area

A styled scrollable container with custom scrollbar appearance, built on Radix ScrollArea.

## Props

### ScrollArea

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Scrollable content |

### ScrollBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Scrollbar direction |
| `className` | `string` | — | Additional CSS classes |

## Usage guidelines

Use ScrollArea when content overflows a fixed-height container and you want consistent, styled scrollbars across browsers.

Do not use ScrollArea for the page-level scroll — let the browser handle that natively.

## Best practices

**Do:** Set a fixed height on the ScrollArea container so scrolling is triggered.

**Do:** Use ScrollArea for long lists, code blocks, or any content that needs a bounded viewport.

**Don't:** Nest ScrollAreas — nested scroll containers confuse users.

**Don't:** Hide scrollbars on content that users need to discover is scrollable.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
