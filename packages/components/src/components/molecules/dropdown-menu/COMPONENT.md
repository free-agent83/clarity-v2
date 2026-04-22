---
name: DropdownMenu
slug: dropdown-menu
version: 0.1.0
status: stable
lastUpdated: 2026-04-22
---

# Dropdown Menu

Menu of actions that opens from a trigger button.

## Props

Dropdown Menu is a compound component. The main pieces:

- `DropdownMenu` — root, controls open state
- `DropdownMenuTrigger` — element that opens the menu
- `DropdownMenuContent` — floating menu container
- `DropdownMenuItem` — individual selectable action
- `DropdownMenuCheckboxItem` — toggleable item with a check mark
- `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` — mutually exclusive items
- `DropdownMenuLabel` — non-interactive group heading
- `DropdownMenuSeparator` — visual divider between groups
- `DropdownMenuGroup` — accessibility-aware grouping
- `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` — nested submenus

All subcomponents accept their Radix primitive props via prop spread.

## Usage guidelines

Use Dropdown Menu for a list of actions related to a trigger — typically a button next to content ("Actions" menu on a row, "More options" on a toolbar). Dropdown Menu is for *actions*, not navigation between pages (use a link, a Tabs component, or Breadcrumbs for navigation).

**Don't use Dropdown Menu** for picking a value to submit — use Select or Combobox. **Don't use Dropdown Menu** for form controls embedded inside a flow — use a Popover.

## Best practices

- **Do:** Use `asChild` on `DropdownMenuTrigger` so the trigger element controls its own semantics.
- **Do:** Group related items with `DropdownMenuSeparator` between groups.
- **Do:** Put destructive items at the bottom, visually separated, with destructive colour.
- **Do:** Use icons next to item labels for scannability — consistent icon style across all items.
- **Don't:** Build deep submenus (4+ levels) — they're hard to navigate on touch devices.
- **Don't:** Mix checkbox items and action items in the same group — use a separator.

## Writing

- Item labels use action verbs: "Delete", "Duplicate", "Rename", "Share".
- Sentence case, short (1–3 words).
- No trailing punctuation.
- Destructive items should name the action plainly: "Delete", not "Remove forever".

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: content repositions near edges via Radix
- [ ] Tokens only: no raw literals inside arbitrary value syntax

## Known deviations

- **`DropdownMenuSubContent` — `min-w-[96px]`** (line ~300 in `dropdown-menu.tsx`): raw pixel literal in Tailwind arbitrary value syntax. Flagged with `// clarity-v2: token-gap` inline comment. Originated from the shadcn/ui scaffold. Replace with a spacing token when one covering 96px (6rem) is available in the token system.
