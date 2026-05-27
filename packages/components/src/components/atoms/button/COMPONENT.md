---
name: Button
slug: button
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "actions-button--default"
description: "Primary interactive element for triggering actions."
---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "success" \| "link"` | `"default"` | Visual style of the button. |
| `size` | `"default" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm"` | `"default"` | Height and padding of the button. Icon sizes are for icon-only buttons. |
| `block` | `boolean` | `false` | Stretch the button to fill its container width. |
| `asChild` | `boolean` | `false` | Render as a child element (via Radix Slot) instead of a native `<button>`. |
| `loading` | `boolean` | `false` | Show a prepended spinner, set `aria-busy`, and force the button disabled. No effect when `asChild` is true. |
| `disabled` | `boolean` | `false` | Native `disabled` attribute. Applies `pointer-events: none` and 50% opacity. |

All standard `<button>` HTML attributes are supported via prop spread.

## Usage guidelines

Use Button for any action that a user triggers synchronously on the current page — submitting a form, opening a dialog, running a local operation.

**Don't use Button** for navigation that changes the URL — use an `<a>` or Next.js `<Link>` instead. If the element needs to *look* like a Button but navigate like a link, use `asChild` to render an anchor with Button styling.

**Don't use Button** to trigger a menu — use `DropdownMenu` and its own trigger, which handles focus and keyboard navigation for you.

## Best practices

**Do:** Use `default` for the primary action on a screen or section — one per section.

**Do:** Use `outline` or `secondary` for non-primary actions next to a primary.

**Do:** Use `destructive` for actions that cannot be undone, and confirm with a dialog first.

**Do:** Use `size: "icon"` (or the `icon-sm` / `icon-xs` variants) for icon-only buttons. Always provide an `aria-label`.

**Do:** Use `loading` for actions that kick off async work — it prepends a spinner, blocks further clicks, and announces the busy state to screen readers.

**Don't:** Use the `link` variant for real navigation — it's for actions that visually resemble links, not for anchors.

**Don't:** Put multiple `default` variants next to each other. If everything is primary, nothing is.

**Don't:** Combine `loading` with `asChild`. The Slot child must own its own loading state — Button silently ignores `loading` in that case.

## Writing

- Use action verbs: "Save", "Delete", "Continue" — not "OK" or "Click here".
- Keep labels short — 1-3 words.
- No ALL CAPS — the component handles text styling.

## Icon Button pattern

Icon-only buttons are a Button usage pattern, not a separate component. Use the `icon`, `icon-sm`, or `icon-xs` sizes and pass exactly one icon as the child. Always provide `aria-label` — without it, the button has no accessible name.

```tsx
import { IconTrash } from "@tabler/icons-react";

<Button size="icon" variant="ghost" aria-label="Delete item">
  <IconTrash />
</Button>
```

**Do:** Set `aria-label` to a short action verb phrase describing what the button does ("Delete item", "Close dialog", "Open menu").

**Don't:** Render more than one child inside an icon button — the size variants are sized for a single icon.

**Don't:** Use an icon button for an action whose meaning isn't clear from the icon alone. If a user might hesitate, add a Tooltip or use a labelled Button instead.

## Known deviations

**Rule 1 — raw literals in arbitrary value syntax.** [`button.tsx`](./button.tsx) contains `rounded-[min(var(--radius-md),10px)]` (on `sm` and `icon-sm` sizes) and `rounded-[min(var(--radius-md),8px)]` (on `icon-xs`). The pixel values (`10px`, `8px`) are raw literals and violate the revised Rule 1 in CONTRIBUTING.md. These values represent a token gap — the min() function is a CSS runtime fallback when `--radius-md` is not defined. Flagged pending per-component review by the design lead — see the inline comments in the TSX.

The `Spinner` atom hardcodes `size-4`. For the `icon-xs` button (which wants `size-3` icons) the spinner renders slightly too large. Minor visual issue; not a blocker.

## Quality checklist

- [x] Accessibility: passes axe-core via `@storybook/addon-a11y`, keyboard navigable (native `<button>` + `focus-visible` styling), announces `aria-busy` when loading
- [x] Responsive: no breakpoint-specific behaviour by design; `block` handles container-fit
- [ ] Tokens only — flagged: raw pixel literals in `rounded-[min(var(--radius-md),10px)]` and `rounded-[min(var(--radius-md),8px)]`. See Known deviations.