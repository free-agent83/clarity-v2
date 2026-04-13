---
name: Badge
slug: badge
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Badge

A small label for displaying status, count, or category information.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline" \| "ghost" \| "link"` | `"default"` | Visual style of the badge |
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot |
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Badge content |

## Usage guidelines

Use Badge for labelling, categorising, or indicating status. Common uses include tags, status indicators, and notification counts.

Do not use Badge for interactive actions — use Button instead. If the badge needs to be clickable, wrap it in an anchor or use the `asChild` pattern.

## Best practices

**Do:** Keep badge text short — one or two words.

**Do:** Use `destructive` for error or warning states.

**Don't:** Use badges as buttons or links unless wrapped with the `asChild` pattern.

**Don't:** Mix too many badge variants in one view — it reduces their signalling power.

## Writing

- Keep labels to 1-2 words: "New", "Beta", "Sold Out"
- Use sentence case: "In progress", not "IN PROGRESS"
- Avoid abbreviations that aren't universally understood

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
