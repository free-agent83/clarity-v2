---
name: Input
slug: input
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "forms-input--default"
description: "Single-line text input for form fields."
---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"text" \| "email" \| "password" \| "number" \| ...` | `"text"` | HTML input type. Controls browser keyboard, validation, and auto-fill behaviour. |
| `disabled` | `boolean` | `false` | Disables the input and prevents interaction. |

All standard HTML `<input>` attributes are supported via prop spread, including `placeholder`, `value`, `defaultValue`, `onChange`, `required`, `aria-invalid`, and `aria-describedby`.

## Usage guidelines

Use Input for single-line free-text or numeric input. Pair every Input with a visible Label and associate them via `htmlFor` / `id`.

**Don't use Input** for multi-line text — use Textarea. **Don't use Input** for selecting from a fixed list of options — use Select, RadioGroup, or Combobox.

## Best practices

- **Do:** Always pair with a Label. Placeholders are not a substitute for labels — they disappear when the user types.
- **Do:** Set `type` to the most specific value (`type="email"`, `type="tel"`, `type="number"`) so mobile keyboards and browser auto-fill work correctly.
- **Do:** Use `aria-invalid={true}` and an associated error description via `aria-describedby` to mark invalid state.
- **Don't:** Use placeholder text for instructions that users need while typing. If the help text is load-bearing, render it as a separate description below the input.
- **Don't:** Disable an input silently. If the field is disabled because of a dependency, explain why.

## Writing

- **Labels:** sentence case, 1–3 words — "Email address", "Phone number".
- **Placeholders:** example values, not instructions — "you@example.com", not "Enter your email". Sentence case.
- Keep error messages specific: "Enter a valid email address", not "Invalid".

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: fills its container width; no breakpoint-specific behaviour
- [x] Tokens only: no raw literals inside arbitrary value syntax