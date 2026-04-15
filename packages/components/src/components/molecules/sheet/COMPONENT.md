---
name: Sheet
slug: sheet
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Sheet

Side-anchored overlay for larger tasks, forms, and persistent panels.

## Props

Sheet is a compound component. The main pieces:

- `Sheet` — root; holds open state
- `SheetTrigger` — element that opens the sheet
- `SheetContent` — content container; `side` selects which edge it slides in from
- `SheetHeader` / `SheetTitle` / `SheetDescription` — structured header
- `SheetFooter` — action buttons
- `SheetClose` — any close-the-sheet element (use with `asChild`)

### SheetContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Which edge of the viewport the sheet slides in from. |
| `showCloseButton` | `boolean` | `true` | Whether to show the built-in close button. |

All subcomponents accept their Radix primitive props via prop spread.

## Usage guidelines

Use Sheet for tasks or panels that need more room than a Dialog but shouldn't navigate away from the current page — editing a record, browsing filters, reviewing details alongside a list.

**Don't use Sheet** for short confirmations — use Dialog. **Don't use Sheet** as a navigation drawer in desktop layouts — use a persistent Sidebar instead.

## Best practices

- **Do:** Use `side="right"` for edit / detail panels on desktop.
- **Do:** Use `side="bottom"` for action sheets on mobile layouts.
- **Do:** Always include a `SheetTitle` and `SheetDescription` — required for accessibility.
- **Do:** Put primary + cancel actions in the `SheetFooter`, not scattered through the content.
- **Don't:** Put so much content inside a Sheet that it requires deep scrolling — at that point, use a full page.
- **Don't:** Open a Sheet from inside another Sheet.

## Writing

- **Title:** concise statement of what's inside. Sentence case. "Edit profile", "Filters", "Order details".
- **Description:** one short sentence of context.
- **Footer buttons:** primary action on the right (e.g. "Save changes"), cancel on the left.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: anchors and sizes adapt to the chosen `side` variant
- [x] Tokens only: no raw literals inside arbitrary value syntax
