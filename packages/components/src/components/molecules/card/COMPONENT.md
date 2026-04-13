---
name: Card
slug: card
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Card

A container for grouping related content and actions into a single visual unit.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Card content |

### Sub-components

- **CardHeader** — Top section of the card, contains title and description.
- **CardTitle** — Primary heading within the card header.
- **CardDescription** — Secondary descriptive text within the card header.
- **CardAction** — Action element positioned in the top-right of the header.
- **CardContent** — Main content area of the card.
- **CardFooter** — Bottom section of the card for actions or metadata.

## Usage guidelines

Use Card to group related information that forms a logical unit — a product summary, a settings section, a notification preview.

Do not use Card as a generic container for layout. If the content doesn't represent a distinct, self-contained piece of information, use plain layout elements instead.

## Best practices

**Do:** Keep card content focused on a single topic or action.

**Do:** Use CardHeader with CardTitle and CardDescription for consistent structure.

**Don't:** Nest cards inside cards. If content needs hierarchical grouping, reconsider the information architecture.

**Don't:** Overload a card with too many actions. Prefer one primary and one secondary action.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
