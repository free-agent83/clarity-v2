---
name: RadioGroup
slug: radio-group
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
---

# RadioGroup

Mutually-exclusive selection from a small set of options. Wraps Radix `RadioGroup`.

## Props

### `RadioGroup`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Uncontrolled initial selected value. |
| `onValueChange` | `(value: string) => void` | — | Called when the selection changes. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Axis used for arrow-key navigation and for the built-in vertical `grid` layout. |
| `disabled` | `boolean` | `false` | Disables every item in the group. |
| `name` | `string` | — | Form field name — enables form submission. |
| `required` | `boolean` | `false` | Marks the group as required inside a `<form>`. |

### `RadioGroupItem`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Unique value this item represents. Required. |
| `disabled` | `boolean` | `false` | Disables this item only. |

All other props on both components are forwarded to the underlying Radix elements.

## Usage guidelines

Use RadioGroup when the user must pick **exactly one** option from a small, fixed set (roughly 2–5). Every option should be visible at the same time — the value of RadioGroup over Select is that the full choice space is legible at a glance.

**Don't use RadioGroup** for independent on/off settings — use `Checkbox` (one per setting). **Don't use RadioGroup** for more than ~5 options — use `Select` so the list doesn't dominate the layout. **Don't use RadioGroup** for binary choices that act immediately — use `Switch`.

## Best practices

**Do:** Pair every `RadioGroupItem` with a visible `Label`, associated via `htmlFor` / `id`.

**Do:** Provide a group-level label (via `Field` or a heading) so screen readers announce the choice being made.

**Do:** Set `defaultValue` (or `value`) to the recommended option when one exists — a group with no pre-selection forces an extra decision on the user.

**Do:** Use `orientation="horizontal"` only when options are short (one word) and fit on a single row without wrapping.

**Don't:** Nest interactive content inside a `RadioGroupItem`'s label — keep labels text-only. Use `Field` descriptions for supporting copy.

**Don't:** Dynamically add or remove options after first render unless the user explicitly triggered it — the selected value may vanish, which is disorienting.

## Writing

- **Option labels:** sentence case, as short as possible — "Standard delivery", not "Choose standard delivery".
- Keep parallel structure across options — all nouns, or all verbs, not a mix.

## Quality checklist

- [x] Accessibility: Radix primitive handles arrow-key navigation, `role="radiogroup"`, and `aria-checked`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: vertical layout is container-width by default; horizontal layout is opt-in via `orientation` + class.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
