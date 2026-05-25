---
name: Progress
slug: progress
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Progress

Linear bar that communicates the completion state of an ongoing task.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Completion percentage, 0 to 100. |
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic colour of the indicator bar. The track is always `bg-muted`. |
| `size` | `"default" \| "lg"` | `"default"` | Track height — `h-1.5` (default) or `h-3` (lg). |

All standard Radix `Progress.Root` HTML attributes are supported via prop spread.

## Usage guidelines

Use Progress when a task has a determinate percentage of completion — uploads, imports, batch actions, profile completeness.

**Don't use Progress** for indeterminate work where no percentage is available — use `Spinner`. **Don't use Progress** as a data visualisation of categorical values — use a bar chart from `Chart`.

## Best practices

**Do:** Match `variant` to the state being communicated — `success` once the task completes, `destructive` if it fails mid-flight, `warning` when approaching a limit, `default` for neutral progress.

**Do:** Pair the bar with a text label (e.g. "12 of 20 uploaded" or "60%") — a bar without a number leaves the user guessing about the actual magnitude.

**Don't:** Animate the indicator independently of `value` — Radix handles the transition, the consumer only updates `value`.

**Don't:** Stack multiple Progress bars to represent multi-stage work — use `Stepper` for ordered steps.

## Quality checklist

- [x] Accessibility: Radix `Progress.Root` exposes `role="progressbar"` and the appropriate `aria-valuenow` / `aria-valuemin` / `aria-valuemax`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the track is 100% width of its container; no breakpoint-specific behaviour by design.
- [x] Tokens only: no raw literals inside arbitrary value syntax.

## Live component

<StorybookEmbed story="feedback-progress--default" />
