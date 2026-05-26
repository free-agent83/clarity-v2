---
name: Slider
slug: slider
version: 0.1.0
status: unstable
lastUpdated: 2026-04-17
story: "forms-slider--default"
---

# Slider

Continuous numeric input controlled by dragging a thumb along a track. Supports single values and ranges, and horizontal or vertical orientation. Wraps Radix `Slider`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number[]` | — | Controlled value. Length `1` = single thumb; length `2` = range. |
| `defaultValue` | `number[]` | `[min, max]` | Uncontrolled initial value. Determines how many thumbs render. |
| `onValueChange` | `(value: number[]) => void` | — | Fires on every drag / key-step change. |
| `onValueCommit` | `(value: number[]) => void` | — | Fires only when interaction ends — use this for expensive side effects (e.g. network requests). |
| `min` | `number` | `0` | Lower bound of the range. |
| `max` | `number` | `100` | Upper bound of the range. |
| `step` | `number` | `1` | Increment applied on keyboard steps and snap on drag. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout axis. Vertical requires a bounded height on the container. |
| `disabled` | `boolean` | `false` | Disables the slider. |
| `inverted` | `boolean` | `false` | Inverts the direction of the track / range fill. |
| `minStepsBetweenThumbs` | `number` | `0` | For range sliders — the minimum steps the two thumbs must stay apart. |

All other props are forwarded to the Radix `Slider.Root` element.

## Usage guidelines

Use Slider when the user picks a value from a continuous range where the **approximate** position matters more than an exact number — volume, filters that refine results, display preferences. Pair with a numeric readout when the exact value is important to the user.

Use the range form (two thumbs) for picking a span within a range — a price filter, a date window.

**Don't use Slider** for precise numeric input — use `Input` with `type="number"`. **Don't use Slider** for a small discrete set of options (2–5) — use `RadioGroup` or `ToggleGroup`.

## Best practices

**Do:** Show the current value somewhere adjacent to the slider. The thumb's position is approximate; users often want to see "how much" explicitly.

**Do:** Use `onValueCommit` (not `onValueChange`) when the change triggers a network request or other expensive work — `onValueChange` fires on every pixel of drag.

**Do:** Set `step` to a value that makes sense for the domain — `1` for counts, `0.1` for fractions, or a larger bucket (e.g. `100` for a price slider) when fine granularity isn't useful.

**Do:** Bound the container height when using `orientation="vertical"` — the component stretches to the parent's height and has a minimum of `min-h-40`.

**Don't:** Use a Slider for input that must hit an exact value (a precise dimension, a percentage the user types). Drag-to-value is imprecise by design.

**Don't:** Stack multiple sliders without clear labels — users lose track of which control affects what.

## Quality checklist

- [x] Accessibility: Radix primitive handles arrow-key stepping, home/end, Page Up / Page Down, `role="slider"`, and `aria-valuemin` / `aria-valuemax` / `aria-valuenow`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: horizontal slider fills its container width; vertical requires an explicit height on the parent.
- [x] Tokens only: no raw literals inside arbitrary value syntax.