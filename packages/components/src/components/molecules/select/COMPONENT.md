---
name: Select
slug: select
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "forms-select--default"
description: "Dropdown control for picking a single value from a list of options."
---

## Props

Select is a compound component. The main pieces:

- `Select` — root; controls value and open state
- `SelectTrigger` — button that opens the listbox
- `SelectValue` — shows the current selection or placeholder inside the trigger
- `SelectContent` — floating listbox
- `SelectItem` — individual option; `value` prop required
- `SelectGroup` / `SelectLabel` — accessibility-aware grouping with a visible heading
- `SelectSeparator` — divider between groups
- `SelectScrollUpButton` / `SelectScrollDownButton` — scroll affordances for long lists

All subcomponents accept their Radix primitive props via prop spread.

## Usage guidelines

Use Select for single-value picks from a moderate list of options (~5–50). Always pair with a Label.

**Don't use Select** for fewer than ~5 options — use RadioGroup, which shows all options at once. **Don't use Select** for very long lists where users need to type — use Combobox. **Don't use Select** for multi-select — use a multi-select Combobox or a checkbox list.

## Best practices

- **Do:** Always pair with a Label — place it above the SelectTrigger.
- **Do:** Provide a placeholder via `SelectValue`'s `placeholder` prop, describing what to select ("Select a country").
- **Do:** Group related options with `SelectGroup` + `SelectLabel` when the option count is high.
- **Do:** Cap the listbox height (`max-h-*` on `SelectContent`) so long lists scroll instead of overflowing the viewport.
- **Don't:** Use Select for navigation between pages. It's a form control, not a navigation primitive.
- **Don't:** Mix disabled items with enabled ones without a visual explanation of why they're disabled.

## Writing

- **Placeholder:** describes the action, not the value. "Select a country", "Choose a plan" — sentence case.
- **Option text:** concise and concrete. "Round brilliant", not "Round brilliant cut (with description)" — put detail in a description element.
- **Group labels:** sentence case, 1–3 words.
- Keep options alphabetically ordered when there's no natural ordering.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: listbox repositions near edges via Radix
- [x] Tokens only: no raw literals inside arbitrary value syntax