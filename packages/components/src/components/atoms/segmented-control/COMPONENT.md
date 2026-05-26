---
name: SegmentedControl
slug: segmented-control
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
story: "forms-segmented-control--default"
---

# SegmentedControl

Inset pill-shaped control for switching between mutually-exclusive UI modes or values. Always single-select, always non-empty — the last selected item remains active.

## Props

### `SegmentedControl`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Currently selected item value. Controlled. |
| `defaultValue` | `string` | — | Initial selected item for uncontrolled use. |
| `onValueChange` | `(value: string) => void` | — | Fires when the selection changes. Never called with an empty string. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Track height — mirrors Button sizes. |

### `SegmentedControlItem`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Identifier for this segment. Required. |
| `disabled` | `boolean` | `false` | Disables this segment. |

All standard Radix `ToggleGroup.Item` HTML attributes are supported via prop spread.

## Usage guidelines

Use SegmentedControl for choosing between a small, fixed set of mutually-exclusive modes — list/grid view, daily/weekly/monthly range, left/centre/right alignment. Two to four items is the sweet spot.

**Don't use SegmentedControl** for multi-select toolbar controls (bold/italic/underline) — use `ToggleGroup`. **Don't use SegmentedControl** for page navigation — use `Tabs`. **Don't use SegmentedControl** when the option set is long, dynamic, or data-driven — use `Select` or `RadioGroup`.

## Best practices

**Do:** Keep labels short (one word where possible) — the inset pill is visually compact and long labels distort the track.

**Do:** Pair each segment with a glyph where the label alone could be ambiguous (map pin icon next to "Map", calendar icon next to "Daily").

**Don't:** Use more than four segments — beyond that, a `Select` or `Tabs` carries the information better.

**Don't:** Nest a SegmentedControl inside another SegmentedControl or inside a ToggleGroup — the visual hierarchy collapses.

## Writing

- Labels are nouns naming the mode ("List", "Grid", "Monthly") — not verbs.
- Sentence case. No punctuation.

## Quality checklist

- [x] Accessibility: Radix `ToggleGroup` with `type="single"` exposes `role="radiogroup"` and `role="radio"` on items; passes axe-core via `@storybook/addon-a11y`; keyboard navigable (arrow keys).
- [x] Responsive: the component is `w-fit` and does not wrap; use a wrapper to constrain width if necessary.
- [x] Tokens only: no raw literals inside arbitrary value syntax.