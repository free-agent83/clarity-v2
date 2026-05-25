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
| `asChild` | `boolean` | `false` | **Deprecated.** Render as a child element via Radix Slot. Will be removed — see [Pending changes](#pending-changes). Do not use in new code. |

All standard HTML attributes for the root `<span>` are supported via prop spread.

## Usage guidelines

Use Badge to show short metadata or status alongside another element — a count next to a list heading, a status next to a row, a category next to a title. Badges are always *about* something else on the page.

**Badge is a display primitive, not an interactive element.** Never use it as a standalone button, never wrap it around a link, and never put a click handler on it. If the user needs to navigate or trigger an action, use a Button (or a real `<a>` styled separately) — never a Badge. This rule is hard: there is no "Badge with `asChild` and an `<a>`" escape hatch. The current `asChild` prop is deprecated and will be removed (see [Pending changes](#pending-changes)).

## Best practices

- **Do:** Use `success` / `warning` / `destructive` / `info` for semantic status ("Active", "Pending", "Failed", "New").
- **Do:** Use `outline` or `ghost` for neutral metadata ("v2.1", "beta", category labels) that doesn't need emphasis.
- **Don't:** Use Badge as a link or a button. Badge is a display-only primitive. If the element needs to navigate, use a Button or a real anchor — wrapping a Badge around an `<a>` is forbidden.
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

## Pending changes

- **Remove `asChild` from the Badge component.** Badge is a display primitive and must not be usable as a link, a button, or any other interactive element. The current `asChild` prop (inherited from the shadcn import) lets consumers wrap Badge around an `<a>` or a button-shaped element, which contradicts this rule. The prop is documented as deprecated above and the `AsLink` story has been removed from `badge.stories.tsx`. The prop itself stays in the API for now to avoid breaking the few existing consumers; a follow-up pass will strip `asChild`, the `Slot.Root` import, and the Radix Slot dependency on Badge entirely.

## Live component

<StorybookEmbed story="display-badge--default" />
