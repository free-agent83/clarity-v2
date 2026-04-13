---
name: DirectionProvider
slug: direction
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# DirectionProvider

Provides a text direction context (`ltr` or `rtl`) to its children via the HTML `dir` attribute.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction for child content |
| `children` | `React.ReactNode` | — | Content to render within the direction context |

## Usage guidelines

Use DirectionProvider to wrap sections of the UI that need explicit text direction control, such as internationalized content that may be rendered in right-to-left languages (Arabic, Hebrew, etc.).

Do not wrap your entire application with DirectionProvider if the document already has a `dir` attribute on `<html>`. Use it for localised sections or overrides only.

## Best practices

**Do:** Wrap RTL content blocks when the surrounding page is LTR (or vice versa).

**Don't:** Nest multiple DirectionProviders unnecessarily — a single wrapper at the section level is sufficient.

**Don't:** Use DirectionProvider for visual mirroring effects — it is for genuine internationalisation, not decoration.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
