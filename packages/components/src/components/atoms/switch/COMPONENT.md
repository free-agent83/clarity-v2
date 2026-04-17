---
name: Switch
slug: switch
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
---

# Switch

Binary on/off control for a setting that takes effect immediately. Wraps Radix `Switch`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial checked state. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called when the user toggles the switch. |
| `size` | `"default" \| "sm"` | `"default"` | Visual size. Use `sm` inside dense UI (table rows, settings lists). |
| `disabled` | `boolean` | `false` | Disables the switch. |
| `required` | `boolean` | `false` | Marks the switch as required inside a `<form>`. |
| `name` | `string` | — | Form field name — enables form submission. |
| `value` | `string` | `"on"` | Form field value sent when checked. |

All other props are forwarded to the Radix `Switch.Root` element.

## Usage guidelines

Use Switch for a setting that applies **the moment the user toggles it** — enabling dark mode, muting notifications, turning on a feature flag. Switches imply immediacy; flipping one should cause the effect right away.

**Don't use Switch** for a choice that is part of a form submission — use `Checkbox`. A Switch inside a form that only takes effect on "Save" misleads the user about when their change applies.

**Don't use Switch** for picking one option from a list of more than two — use `RadioGroup` or `ToggleGroup`.

## Best practices

**Do:** Pair every Switch with a visible `Label` and associate them via `htmlFor` / `id`. The `Label` names the setting (not the state).

**Do:** Use positive framing — "Email notifications" is clearer than "Disable emails". The on/off affordance already communicates direction.

**Do:** Reflect the true state of the underlying setting. If toggling on is an async operation that might fail, mark the switch as pending (e.g. paired with a Spinner or disabled) while the request is in flight.

**Don't:** Use Switch as a command button. If flipping it triggers a multi-step confirmation, the affordance is wrong — use a `Button` that opens a `Dialog`.

**Don't:** Surround Switches with "Save" / "Apply" buttons. The moment you need those, switch to Checkboxes.

## Writing

- **Labels:** sentence case, name the setting not the action — "Marketing emails", not "Enable marketing emails".
- Pair with a short description where the effect of the setting isn't self-evident.

## Known deviations

**Rule 1 — raw literals in arbitrary value syntax.** [`switch.tsx`](./switch.tsx) uses `h-[14px]`, `w-[24px]`, `size-[18px]`, `translate-x-[calc(100%-3px)]`, and `translate-x-[calc(100%-2px)]`. The pixel values are raw literals inherited from the shadcn/ui source and violate Rule 1 as defined in [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md).

The `h-[14px]`, `w-[24px]`, and `size-[18px]` literals have canonical spacing-token equivalents (`h-3.5`, `w-6`, `size-4.5`) — swapping them is mechanical. The two `translate-x-[calc(100%-Npx)]` values are true token gaps: they mix a percentage with a raw pixel inset. All five are deferred to a design-lead pass per the Phase B flag-don't-fix policy.

## Quality checklist

- [x] Accessibility: Radix primitive handles `role="switch"`, `aria-checked`, and keyboard toggling; passes axe-core via `@storybook/addon-a11y`; labelled via associated `Label`.
- [x] Responsive: fixed size by design; layout is owned by the parent container.
- [ ] Tokens only — flagged: raw pixel literals on `sm` track dimensions and thumb translate. See Known deviations.
