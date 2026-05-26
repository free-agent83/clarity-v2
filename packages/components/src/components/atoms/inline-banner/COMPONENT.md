---
name: InlineBanner
slug: inline-banner
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
story: "feedback-inline-banner--default"
---

# InlineBanner

Block-level, page-level callout that communicates persistent page-level information or promotional content. Uses solid semantic fills to declare itself boldly within page content — distinct from `Alert`, which uses tinted backgrounds for quieter section-level messages.

## Props

### `InlineBanner`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic colour. Solid fill; `default` uses brand primary. |
| `size` | `"default" \| "lg"` | `"default"` | Overall banner size. |
| `onDismiss` | `() => void` | — | If provided, renders a close (X) button in the top-right. Stateless — the consumer removes the banner from the tree. |

All standard `<div>` HTML attributes are supported via prop spread.

### Sub-components

- `InlineBannerTitle` — required heading slot.
- `InlineBannerDescription` — optional body slot.
- `InlineBannerAction` — right-aligned action slot. Holds exactly one CTA (typically an inline link).

An optional leading icon is passed as a direct `<svg>` child of `InlineBanner` (typically from `@tabler/icons-react`). The component detects it and places it in a vertically-centred icon column.

## Usage guidelines

Use InlineBanner under a page heading to surface persistent, page-level information — promotional callouts, feature announcements, advisory notices that apply to the whole view. Typical placements: below a dashboard heading, below a PLP heading, in an onboarding flow.

**Don't use InlineBanner** for section-level messages — use `Alert`. **Don't use InlineBanner** for app-wide callouts above the navigation — use `PageBanner`. **Don't use InlineBanner** for transient confirmations — use `Sonner` (toast).

## Best practices

**Do:** Use `default` size for most page callouts. Reach for `lg` when the message warrants more visual weight.

**Do:** Pair `variant` with a matching Tabler icon — `IconCircleCheck` for success, `IconAlertTriangle` for warning, `IconAlertCircle` for destructive, `IconInfoCircle` for info.

**Don't:** Stack multiple InlineBanners in the same region. If the page has multiple conditions to surface, consolidate or rank and show the highest-priority one.

## Writing

- **Title:** one short sentence, sentence case. "New: AI-assisted search". No trailing punctuation.
- **Description:** plain prose explaining what the banner is announcing and what the user can do.
- Avoid "Warning:" / "Error:" prefixes — the variant and icon already carry the signal.

## Quality checklist

- [x] Accessibility: `role="status"` on the root; dismiss button has `aria-label`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the banner is full-width and the actions slot wraps below at narrow widths.
- [x] Tokens only: no raw literals inside arbitrary value syntax.