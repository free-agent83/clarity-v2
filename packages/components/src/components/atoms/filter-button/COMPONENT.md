---
name: FilterButton
slug: filter-button
version: 0.1.0
status: unstable
lastUpdated: 2026-04-16
---

# FilterButton

Two-state control for applied filters. Combines a Popover trigger and (when active) an inline dismiss action into a single rounded outline unit. Styled on Button's outline variant.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Filter name, always visible (e.g. "Color"). |
| `valueSummary` | `string \| undefined` | `undefined` | Formatted display of the current value (e.g. "Blue, Green +3 more"). When provided, the button renders in the active state with inline dismiss. Omit for the inactive/empty state. |
| `popoverContent` | `ReactNode` | — | Content rendered inside the popover when the main click area is activated. Typically the filter's control UI plus Apply / Clear actions. |
| `popoverWidth` | `number \| string` | — | Optional fixed width for the popover content (pixels or CSS length). |
| `onDismiss` | `() => void` | — | Called when the user clicks the inline dismiss X on an active filter. Required in the active state; ignored when inactive. |
| `open` | `boolean` | — | Controlled open state of the popover. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the popover open state changes. |
| `className` | `string` | — | Extra classes on the outer element. |

## Usage guidelines

FilterButton is the standard surface for any filter whose value can be applied from a popover — quick filters in a toolbar, engaged filters rendered inline, and any other context where a user edits or dismisses a filter without navigating away.

**When to use:** anywhere a filter's label + applied value + edit popover need to live in a single toolbar-height control.

**When NOT to use:** for non-filter actions (use `Button`), for multi-step filter workflows that don't fit in a popover (use a `Sheet` or dedicated page), or for read-only value displays (use `Badge` or a plain span).

## Best practices

**Do:** Pass a concise, comma-joined `valueSummary` for multi-value filters. Truncate at two or three values with `+N more` rather than listing everything — long value summaries make the toolbar feel cluttered.

**Do:** Reset the popover's draft state whenever it closes, so reopening starts fresh from the applied value.

**Do:** Provide `onDismiss` whenever `valueSummary` is present. Consumers should be able to clear the filter without opening the popover.

**Don't:** Mix inline icon adornments into the label — the label is plain text. If you need iconography, put it inside the popover content.

**Don't:** Use FilterButton for things that aren't filters. The `label: value` framing is specific to applied filter state.

## Active vs inactive state

| State | Visual | Interaction |
|-------|--------|-------------|
| Inactive (`valueSummary` omitted) | Outline button with just the label, matching `Button variant="outline"`. | Click opens the popover. No dismiss affordance. |
| Active (`valueSummary` provided) | Filled muted background. Split into two regions: `label: value` on the left (click to edit) and an X on the right (click to dismiss). | Clicking the left region opens the popover; clicking the X calls `onDismiss`. Both share a unified focus ring. |

## Quality checklist

- [x] Accessibility: both regions are keyboard-focusable; dismiss X has `aria-label="Remove filter: {label}"`; popover inherits accessible name from the filter label
- [x] Responsive: no breakpoint-specific behaviour; consumers handle layout wrapping in the surrounding container
- [x] Tokens only: border/background/text styles use semantic utility classes; no raw colour or spacing literals
