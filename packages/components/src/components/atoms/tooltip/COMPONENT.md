---
name: Tooltip
slug: tooltip
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "overlays-tooltip--default"
description: "Floating label shown on hover or focus, providing a short hint about an element."
---

## Props

Tooltip is a compound component. Compose it from:

- `TooltipProvider` — required ancestor, typically at the app root.
- `Tooltip` — wraps a trigger and its content.
- `TooltipTrigger` — the element that shows the tooltip on hover/focus. Pass `asChild` to avoid adding an extra wrapper.
- `TooltipContent` — the floating content.

`TooltipContent` accepts Radix positioning props: `side` (`"top" | "right" | "bottom" | "left"`), `align` (`"start" | "center" | "end"`), and `sideOffset` (pixels).

## Usage guidelines

Use Tooltip to explain icon-only buttons, truncated text, and non-obvious controls. Tooltips must be progressive enhancement — never put essential information in a tooltip alone, since they're hidden on touch devices and by some assistive tech.

**Don't use Tooltip** for form validation errors — use inline error text. **Don't use Tooltip** for long explanations — use a Popover or an inline description.

## Best practices

- **Do:** Wrap your app (or Storybook decorator) in a single `TooltipProvider`. Nested providers lead to inconsistent open delays.
- **Do:** Put a Tooltip on every icon-only Button whose meaning isn't immediately obvious.
- **Do:** Use `asChild` on `TooltipTrigger` to avoid adding an extra `<button>` wrapper around interactive triggers.
- **Don't:** Hide required interactions behind a tooltip. If the user *needs* to see it to proceed, it isn't a tooltip.
- **Don't:** Put interactive content (links, buttons) inside a TooltipContent — tooltips close on mouse-out.

## Writing

- Keep content to one short phrase or a single sentence.
- Sentence case.
- Phrases: no trailing punctuation ("Add new item").
- Sentences: end with a period ("Adds a new item to the list.").

## Known deviations

- `TooltipContent` Arrow positioning uses raw pixel values (`translate-y-[calc(-50%_-_2px)]`, `rounded-[2px]`) from shadcn upstream. These are Radix primitives for arrow geometry and should be replaced with token-based sizing when token structure supports computed positioning.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: no breakpoint-dependent behaviour
- [ ] Tokens only: no raw literals inside arbitrary value syntax