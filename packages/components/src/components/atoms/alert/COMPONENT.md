---
name: Alert
slug: alert
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
story: "feedback-alert--default"
---

# Alert

Inline, non-blocking message that communicates a status, warning, or piece of contextual information at the top of a surface or next to the content it relates to.

## Props

### `Alert`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "warning" \| "info" \| "success"` | `"default"` | Semantic style. Determines background tint and text colour. |

All standard `<div>` HTML attributes are supported via prop spread.

### `AlertTitle`, `AlertDescription`, `AlertAction`

Presentational sub-components. Each accepts all standard `<div>` HTML attributes. `AlertAction` is absolutely positioned to the top-right of the Alert — render a single action (typically a Button) inside it.

An optional leading icon is rendered by passing an `<svg>` (e.g. a `@tabler/icons-react` icon) as a direct child of `Alert`; the component lays out title and description in a two-column grid when an icon is present.

## Usage guidelines

Use Alert to communicate persistent, in-context information — a validation error attached to a form, a note at the top of a page, a warning about a destructive flow. The Alert sits within the page flow; it does not overlay or block interaction.

**Don't use Alert** for transient notifications — use `Sonner` (toast) for ephemeral confirmations and background events. **Don't use Alert** as a modal interruption — use `Dialog` when the user must acknowledge the message before continuing.

## Best practices

**Do:** Match `variant` to the message's semantic intent — `destructive` for errors, `warning` for reversible risks, `success` for confirmations, `info` for neutral guidance, `default` for everything else.

**Do:** Pair `variant` with a matching icon when one adds clarity — a red `IconAlertCircle` for destructive, a green `IconCheck` for success.

**Do:** Keep the title short and action-oriented; put the detail in `AlertDescription`.

**Do:** Use `AlertAction` for at most one primary resolution action ("Retry", "Save", "Dismiss"). If more than one action is required, reconsider whether a Dialog is the better surface.

**Don't:** Stack multiple Alerts in the same region. If the page has multiple conditions to surface, consolidate them or rank and show only the highest-priority one.

**Don't:** Use Alert for form-field-level error text — use `Field` with its description/error slot so the message is associated with the specific input.

## Writing

- **Title:** one short sentence — "Shipment delayed", "Unsaved changes". Sentence case.
- **Description:** plain prose that explains what happened and, where relevant, what the user should do.
- Avoid "Warning:" / "Error:" prefixes — the variant and icon already carry that signal.

## Quality checklist

- [x] Accessibility: `role="alert"` on the root; passes axe-core via `@storybook/addon-a11y`; no interactive elements inside the Alert itself (actions go in `AlertAction`).
- [x] Responsive: description uses `text-balance` / `text-pretty`; no breakpoint-specific behaviour by design.
- [x] Tokens only: no raw literals inside arbitrary value syntax.