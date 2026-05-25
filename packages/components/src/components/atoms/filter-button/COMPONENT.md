---
name: FilterButton
slug: filter-button
version: 0.2.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterButton

Generic two-state control for applied filters. Owns per-popover draft state internally and exposes a render-prop `children` API so consumers write a controlled filter component without managing the draft lifecycle themselves.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Filter name, always visible (e.g. "Color"). |
| `chipSummary` | `string \| undefined` | `undefined` | Formatted display of the current applied value (e.g. "Blue, Green +3 more"). Shown in the active chip as `label: chipSummary`. Omit when inactive. |
| `isActive` | `boolean` | — | When `true`, renders the active-state split button with `label: chipSummary` and an inline dismiss X. When `false`, renders the inactive single button with a trailing chevron. |
| `initialValue` | `V \| undefined` | — | Seeds the internal draft each time the popover opens. Typically the consumer's currently-applied value so that reopening the popover starts from the committed state. |
| `popoverWidth` | `number \| string` | — | Optional fixed width for the popover content (pixels or CSS length). |
| `onApply` | `(value: V \| undefined) => void` | — | Called with the current draft value when the user clicks Apply. The popover closes automatically. |
| `onClear` | `() => void` | — | Called when the user clicks Clear. Internally resets draft to `undefined`. The popover closes automatically. |
| `onDismiss` | `() => void` | — | Called when the user clicks the inline dismiss X on an active chip. No popover interaction. Only rendered when `isActive` is `true`. |
| `children` | `(draft: V \| undefined, setDraft: (v: V \| undefined) => void) => ReactNode` | — | Render prop for the filter control rendered inside the popover body, above Apply / Clear. Receives the current draft value and setter. |
| `className` | `string` | — | Extra classes on the outer element. |

## Usage guidelines

FilterButton is the standard surface for any filter whose value can be applied from a popover — quick filters in a toolbar, engaged filters rendered inline, and any other context where a user edits or dismisses a filter without navigating away.

The component is generic over the filter value type `V`. Consumers declare the type at the call site: `<FilterButton<string[]> ...>`.

**Draft lifecycle:** each time the popover opens, `draft` is reseeded from `initialValue`. The draft mutates as the user interacts with the inner control. Clicking Apply commits `draft` via `onApply`; clicking Clear resets to `undefined` via `onClear`. Neither action survives a popover-open without an explicit Apply — reopening reseeds from `initialValue` again.

**When to use:** anywhere a filter's label + applied value + edit popover need to live in a single toolbar-height control.

**When NOT to use:** for non-filter actions (use `Button`), for multi-step filter workflows that don't fit in a popover (use a `Sheet` or dedicated page), or for read-only value displays (use `Badge` or a plain span).

## Best practices

**Do:** Pass a concise, comma-joined `chipSummary` for multi-value filters. Truncate at two or three values with `+N more` rather than listing everything — long value summaries make the toolbar feel cluttered.

**Do:** Pass the currently-applied value as `initialValue` so the popover always opens from the committed state rather than stale or blank state.

**Do:** Provide `onDismiss` whenever `isActive` is `true`. Consumers should be able to clear the filter without opening the popover.

**Don't:** Mix inline icon adornments into the label — the label is plain text. If you need iconography, put it inside the render-prop content.

**Don't:** Use FilterButton for things that aren't filters. The `label: value` framing is specific to applied filter state.

## Active vs inactive state

| State | Visual | Interaction |
|-------|--------|-------------|
| Inactive (`isActive: false`) | Outline button with the label followed by a trailing chevron-down icon, matching `Button variant="outline"`. The chevron signals that the button opens a popover. | Click opens the popover. No dismiss affordance. |
| Active (`isActive: true`) | Filled accent background. Split into two regions: `label: value` on the left (click to edit) and an X on the right (click to dismiss). No chevron — the dismiss X is the trailing affordance. | Clicking the left region opens the popover; clicking the X calls `onDismiss`. Both share a unified focus ring. |

## Quality checklist

- [x] Accessibility: both regions are keyboard-focusable; dismiss X has `aria-label="Remove filter: {label}"`; popover inherits accessible name from the filter label
- [x] Responsive: no breakpoint-specific behaviour; consumers handle layout wrapping in the surrounding container
- [x] Tokens only: border/background/text styles use semantic utility classes; no raw colour or spacing literals

## Live component

<StorybookEmbed story="filtering-filterbutton--inactive" />
