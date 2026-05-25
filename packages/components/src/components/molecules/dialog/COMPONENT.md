---
name: Dialog
slug: dialog
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Dialog

Modal overlay for focused tasks that require user attention.

## Props

Dialog is a compound component. The main pieces:

- `Dialog` — root; holds open state
- `DialogTrigger` — element that opens the dialog
- `DialogContent` — content container with a built-in close button
- `DialogHeader` / `DialogTitle` / `DialogDescription` — structured header
- `DialogFooter` — action buttons, optionally with a built-in Close button
- `DialogClose` — any close-the-dialog element (use with `asChild`)
- `DialogOverlay` / `DialogPortal` — overlay and portal primitives, usually rendered automatically

### DialogContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | `boolean` | `true` | When `true`, renders a built-in close button in the top-right of the content. Set `false` for critical confirmations where the user must make an explicit choice. |

### DialogFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | `boolean` | `false` | When `true`, appends a secondary outline Close button at the end of the footer. |

All subcomponents accept their Radix primitive props (or `<div>` attributes for header/footer) via prop spread.

## Usage guidelines

Use Dialog for tasks that require the user's full attention and block interaction with the rest of the page — confirmations, short forms, critical alerts. A Dialog should always have a clear exit (Cancel, Close, or pick an action).

**Don't use Dialog** for passive content — use a Popover or a Sheet. **Don't use Dialog** for long forms or multi-step flows — use a full page or a Sheet, which gives more room. **Don't use Dialog** to show errors that happen during another task — use an inline Alert instead.

## Best practices

- **Do:** Always include a `DialogTitle` and `DialogDescription` — required for accessibility.
- **Do:** Put the primary action on the right of the footer and the cancel / secondary action on the left.
- **Do:** Use `variant="destructive"` on the primary button for destructive actions and explicitly name what will be deleted.
- **Do:** Use `showCloseButton={false}` on `DialogContent` for critical confirmations where the user must pick an explicit action (not "close").
- **Don't:** Nest dialogs — if a dialog needs its own confirmation, replace the dialog's content instead of opening a second layer.
- **Don't:** Auto-close a dialog on success without a brief confirmation — the user should know why the dialog went away.

## Writing

- **Title:** a clear question or statement. Sentence case. No punctuation unless it's a question ending in a question mark.
  - Do: "Delete your account?"
  - Don't: "Deletion Confirmation"
- **Description:** one short sentence describing what will happen. End with a period.
  - Do: "This permanently deletes your account and all your data."
  - Don't: "Are you really sure you want to do this?"
- **Button labels:** match the action in the title. If the title is "Delete your account?", the destructive button is "Delete account" — not "Yes" or "Confirm".

## Known deviations

**Rule 1 — raw literal in arbitrary value syntax.** [`dialog.tsx`](./dialog.tsx) contains `max-w-[calc(100%-2rem)]` on `DialogContent`. The `2rem` is a raw literal and violates the revised Rule 1 in CONTRIBUTING.md. Flagged pending per-component review by the design lead — see the inline JSX comment in the TSX.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: content caps at `sm:max-w-md` on small screens and above
- [ ] Tokens only — flagged: raw `2rem` literal in `max-w-[calc(100%-2rem)]`. See Known deviations.

## Live component

<StorybookEmbed story="overlays-dialog--default" />
