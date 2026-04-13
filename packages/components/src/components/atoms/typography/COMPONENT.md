---
name: Typography
slug: typography
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Typography

A semantic text component that maps variant names to the appropriate HTML tag and Tailwind typography classes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"h1" \| "h2" \| "h3" \| "h4" \| "p" \| "lead" \| "large" \| "small" \| "muted"` | `"p"` | Typography style and semantic tag |
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Text content |

## Usage guidelines

Use Typography instead of raw `<h1>`/`<p>` tags to ensure consistent design-system typography is applied automatically.

Heading variants (`h1`-`h4`) render their corresponding HTML heading tag. All other variants render a `<p>` tag with appropriate styling.

## Best practices

**Do:** Use heading variants in the correct hierarchy — `h1` then `h2` then `h3`, never skip levels.

**Do:** Use `lead` for introductory paragraphs that need more visual weight.

**Do:** Use `muted` for secondary information like timestamps, help text, or disclaimers.

**Don't:** Use heading variants purely for visual size. If you need large text that isn't a heading, use `large`.

**Don't:** Override the font size or weight via className — choose the correct variant instead.

## Writing

- Write headings in sentence case: "Account settings", not "Account Settings"
- Keep headings concise: aim for 3-8 words
- Use the `muted` variant for supplementary text, not for body copy

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
