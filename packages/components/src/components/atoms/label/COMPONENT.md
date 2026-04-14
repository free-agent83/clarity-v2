---
name: Label
slug: label
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Label

Accessible text label for form controls.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | — | `id` of the associated form control. Required for accessibility — clicking the label focuses the control. |

All standard HTML attributes for the root `<label>` are supported via prop spread.

## Usage guidelines

Use Label to name every form control. Always set `htmlFor` to the control's `id` — without it, screen readers cannot associate the label with the control, and clicking the label does nothing.

**Don't use Label** for headings, captions, or decorative text. **Don't use Label** for read-only values — use a description element instead.

## Best practices

- **Do:** Always provide `htmlFor` matching the control's `id`.
- **Do:** Place the Label immediately above its control, or to the left in dense forms.
- **Do:** Use sentence case — "Email address", not "Email Address" or "EMAIL ADDRESS".
- **Don't:** Append a colon ("Email address:") — use layout and typography to separate the label from the control.
- **Don't:** Hide required-field indicators from the label text — mark them visibly *and* in the accessible name.

## Writing

- Use sentence case: "Email address", "Phone number", "Date of birth".
- Keep labels short — 1–3 words.
- No trailing colons, no ALL CAPS.
- Be specific: "Email address" beats "Email"; "Phone number" beats "Phone".

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: no breakpoint-dependent behaviour
- [x] Tokens only: no raw literals inside arbitrary value syntax
