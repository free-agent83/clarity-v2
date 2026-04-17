---
name: Checkbox
slug: checkbox
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
---

# Checkbox

Binary on/off control for selecting one or more options from a set, or toggling a single setting. Wraps Radix `Checkbox`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial checked state. |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | — | Called when the user toggles the checkbox. |
| `disabled` | `boolean` | `false` | Disables the checkbox and prevents interaction. |
| `required` | `boolean` | `false` | Marks the checkbox as required inside a `<form>`. |
| `name` | `string` | — | Form field name — enables form submission. |
| `value` | `string` | `"on"` | Form field value sent when checked. |

All other props are forwarded to the Radix `Checkbox.Root` element. Standard HTML attributes such as `id`, `aria-invalid`, `aria-describedby`, and `aria-labelledby` are supported.

## Usage guidelines

Use Checkbox for independent choices — each checkbox represents a separate yes/no decision. A single checkbox reads as "turn this one thing on"; a group of checkboxes reads as "turn on zero or more of these things".

**Don't use Checkbox** to pick exactly one option from a set — use `RadioGroup`. **Don't use Checkbox** for a single setting that takes effect immediately — use `Switch`. **Don't use Checkbox** for a command that triggers an action — use `Button`.

## Best practices

**Do:** Pair every Checkbox with a visible `Label` and associate them via `htmlFor` / `id`. The Checkbox itself renders no text.

**Do:** In a group of related checkboxes, nest them under a common `Field` (or equivalent) with a group label — "Notification preferences", not individually captioned checkboxes.

**Do:** Use `aria-invalid={true}` to surface validation errors; pair with a `Field` description describing what's wrong.

**Don't:** Use Checkbox for a setting that applies the moment it changes — a `Switch` is the right affordance there. Checkboxes imply "I'm selecting; I'll submit later".

**Don't:** Build custom tristate behaviour from two Checkboxes. Use the built-in `"indeterminate"` value when you need a parent checkbox that reflects a partial selection.

## Writing

- **Labels:** sentence case, short, and phrased as the thing being turned on — "Marketing emails", "Remember me", not "Do you want marketing emails?".
- Avoid negative framing — "Hide completed tasks" is clearer than "Do not show completed tasks".

## Known deviations

**Rule 1 — raw literal in arbitrary value syntax.** [`checkbox.tsx`](./checkbox.tsx) uses `rounded-[4px]`. `4px` is a raw literal, not a token reference, and violates Rule 1 as defined in [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md). This value is inherited from the shadcn/ui source; replacing it with a token mapping is a design-lead judgement call and has been deferred.

## Quality checklist

- [x] Accessibility: Radix primitive handles keyboard and ARIA; passes axe-core via `@storybook/addon-a11y`; labelled via associated `Label`.
- [x] Responsive: fixed size by design; layout is owned by the parent container.
- [ ] Tokens only — flagged: `rounded-[4px]` raw literal. See Known deviations.
