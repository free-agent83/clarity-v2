---
name: Popover
slug: popover
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "overlays-popover--default"
---

# Popover

Floating container anchored to a trigger element, opened on click.

## Props

Popover is a compound component. Compose it from:

- `Popover` — root
- `PopoverTrigger` — the element that opens the popover
- `PopoverAnchor` — optional, for decoupling the trigger from the anchor point
- `PopoverContent` — the floating content
- `PopoverHeader`, `PopoverTitle`, `PopoverDescription` — optional structured header

`PopoverContent` accepts Radix positioning props: `side`, `align`, `sideOffset`.

## Usage guidelines

Use Popover for secondary content that a user opts into — forms, pickers, settings panels — anchored to a trigger element. Popover is for content that needs to stay open while the user interacts with it.

**Don't use Popover** for passive hints — use Tooltip. **Don't use Popover** for primary modal workflows — use Dialog. **Don't use Popover** for menus — use Dropdown Menu, which handles keyboard navigation as a menu.

## Best practices

- **Do:** Use `asChild` on `PopoverTrigger` so the trigger element controls its own semantics.
- **Do:** Give forms inside popovers a clear affordance to close and save — the user shouldn't have to guess.
- **Do:** Keep content focused — popovers are ~300-400px wide, not full forms.
- **Don't:** Open a popover automatically on page load.
- **Don't:** Nest popovers.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: floating content repositions near edges via Radix
- [x] Tokens only: no raw literals inside arbitrary value syntax