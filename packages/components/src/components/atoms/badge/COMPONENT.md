---
name: Badge
slug: badge
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Badge

Small status or metadata indicator attached to another element.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "success" \| "warning" \| "info" \| "outline" \| "ghost" \| "link"` | `"default"` | Visual style of the badge. |
| `size` | `"default" \| "sm"` | `"default"` | Height of the badge. |
| `asChild` | `boolean` | `false` | Render as a child element (via Radix Slot) instead of a native `<span>`. |

All standard HTML attributes for the root `<span>` are supported via prop spread.

## Usage guidelines

Use Badge to show short metadata or status alongside another element — a count next to a list heading, a status next to a row, a category next to a title. Badges should always be *about* something else on the page.

**Don't use Badge** as a standalone button or link. If the element needs to be clickable navigation, use `asChild` to render an anchor, or use a Button instead.

## Best practices

- **Do:** Use `success` / `warning` / `destructive` / `info` for semantic status ("Active", "Pending", "Failed", "New").
- **Do:** Use `outline` or `ghost` for neutral metadata ("v2.1", "beta", category labels) that doesn't need emphasis.
- **Do:** Pass `asChild` with an `<a>` when the badge should navigate.
- **Don't:** Put more than a few words in a badge. If the content needs a sentence, it belongs in a Card, Alert, or tooltip.
- **Don't:** Stack multiple badges of the same variant — the variant loses its signal when everything is the same colour.

## Writing

- Keep labels to 1–2 words: "Active", "Beta", "New", "Pending".
- Sentence case: "In review", not "IN REVIEW" or "in review".
- No trailing punctuation.
- Use nouns and adjectives, not verbs: "Draft", not "Save draft".

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: no breakpoint-dependent behaviour
- [ ] Tokens only: no raw literals inside arbitrary value syntax

## Known deviations

- `ring-[3px]` uses a raw literal for focus-ring width; needs a dedicated focus-ring token in the design system.
