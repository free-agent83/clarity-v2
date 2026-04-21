---
name: RangeSliderFilter
slug: plp-range-slider-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# RangeSliderFilter

Two-thumb slider with commit-on-blur numeric inputs for a numeric min/max range. Optional histogram renders behind the slider track and highlights the selected sub-range.

Selecting the full `[min, max]` range collapses the value to `undefined` so consumers can treat "filter not engaged" uniformly.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `{ min: number; max: number } \| undefined` | — | Selected range, or `undefined` when the full range is selected |
| `onChange` | `(value) => void` | — | Called when slider or inputs commit |
| `min` | `number` | — | Lower bound of the selectable range |
| `max` | `number` | — | Upper bound of the selectable range |
| `step` | `number` | `1` | Increment between slider stops |
| `unit` | `string \| undefined` | — | Display unit. Currencies (`$`, `€`, `£`, `¥`, `USD`/`EUR`/`GBP`/`JPY`) render as a prefix; everything else as a suffix. |
| `histogram` | `RangeSliderHistogram \| undefined` | — | Distribution bars drawn behind the slider track |

### RangeSliderHistogram

| Field | Type | Description |
|-------|------|-------------|
| `buckets` | `number[]` | Equal-width bucket counts across `[min, max]` |
| `min` | `number` | Histogram domain lower bound |
| `max` | `number` | Histogram domain upper bound |

## Quality checklist

- [x] Accessibility: labelled inputs, keyboard-operable slider
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
