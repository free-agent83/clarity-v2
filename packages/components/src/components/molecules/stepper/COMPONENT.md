---
name: Stepper
slug: stepper
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Stepper

Displays progress through an ordered, multi-step flow. Typical use is inside a `Dialog`-based checkout, returns, or onboarding wizard. Horizontal only in v0.1.

## Props

### `Stepper`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeStep` | `number` | — | Zero-indexed current step. Required. Controlled. |
| `errorSteps` | `ReadonlyArray<number>` | `[]` | Indices flagged as errored. Wins over derived state. |
| `onStepClick` | `(index: number) => void` | — | If provided, `completed` and `error` steps become clickable. |

### Sub-components

- `StepperItem` — one step. Derives its state and index from context; the consumer does not pass them explicitly.
- `StepperItemIndicator` — the circle. Renders the step number by default, a checkmark when completed, or `IconAlertCircle` when errored.
- `StepperItemLabel` — the step's text label.

## Usage guidelines

Use Stepper inside modal or dialog-based flows where the user completes a series of ordered steps — checkout, returns, account setup.

**Don't use Stepper** for general page navigation — use `Tabs` or `Breadcrumb`. **Don't use Stepper** for a single `Progress`-style percentage indicator — use `Progress`. **Don't use Stepper** to represent optional or out-of-order tasks — the component assumes sequential progress.

## Best practices

**Do:** Keep labels short (1–2 words). The component is horizontal and long labels break the layout.

**Do:** Flag errored steps via `errorSteps` *and* provide `onStepClick` so the user can navigate back to fix them.

**Don't:** Render a Stepper with more than five or six steps — horizontal space runs out. If a flow has more steps, reconsider its structure or split into grouped phases.

**Don't:** Mutate `activeStep` on step click unless you intend the click to be a navigation — gate on whether it makes sense for your flow.

## Writing

- Labels are nouns describing the step: "Details", "Shipping", "Payment", "Review" — not imperative phrases.
- Sentence case, no punctuation.

## Quality checklist

- [x] Accessibility: clickable items get `role="button"`, `tabIndex={0}`, and keyboard activation (Enter / Space); current step gets `aria-current="step"`. Passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the component is flex-based and fills its container; individual items do not shrink below their content width.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
