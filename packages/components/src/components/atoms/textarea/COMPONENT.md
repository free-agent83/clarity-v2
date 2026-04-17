---
name: Textarea
slug: textarea
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
---

# Textarea

Multi-line text input that auto-grows to fit its content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | — | Initial height in rows. Textarea still auto-grows with content via `field-sizing: content`. |
| `disabled` | `boolean` | `false` | Disables the textarea and prevents interaction. |

All standard HTML `<textarea>` attributes are supported via prop spread, including `placeholder`, `value`, `defaultValue`, `onChange`, `maxLength`, `required`, `aria-invalid`, and `aria-describedby`.

## Usage guidelines

Use Textarea for free-form, multi-line input where the length is open-ended — feedback, descriptions, notes, messages. The field grows with the content up to the container's constraints; no manual resize handle is rendered.

**Don't use Textarea** for single-line input — use `Input`. **Don't use Textarea** for structured input (dates, phone numbers, amounts) — use `Input` with an appropriate `type`.

## Best practices

**Do:** Always pair with a visible `Label` and associate them via `htmlFor` / `id`.

**Do:** Set a `maxLength` when the backend enforces one, and surface the remaining character count next to the field when the limit is load-bearing.

**Do:** Use `aria-invalid={true}` and an associated description via `aria-describedby` to mark validation errors.

**Don't:** Set `rows` so small that the user can't see what they just typed. Three rows is a sensible floor for most use cases.

**Don't:** Disable the field silently. If the field is disabled because of a dependency, explain why.

## Writing

- **Labels:** sentence case, 1–3 words — "Feedback", "Additional notes".
- **Placeholders:** example prompts, not instructions — "Tell us what you think...", not "Enter your feedback here".
- Error messages should be specific and actionable — "Feedback must be at least 10 characters", not "Invalid input".

## Quality checklist

- [x] Accessibility: native `<textarea>`; passes axe-core via `@storybook/addon-a11y` when paired with a `Label`.
- [x] Responsive: fills its container width; height grows with content via `field-sizing: content`.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
