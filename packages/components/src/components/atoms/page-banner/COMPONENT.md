---
name: PageBanner
slug: page-banner
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# PageBanner

Full-bleed stripe that sits above the application navigation header. Communicates product-wide callouts — new features, promotions, downtime, holidays. Solid-filled for visual weight; always app-level.

## Props

### `PageBanner`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic colour. `default` uses the brand primary. |
| `onDismiss` | `() => void` | — | If provided, renders a close (X) button on the right edge. Stateless. |

All standard `<div>` HTML attributes are supported via prop spread.

### Sub-components

- `PageBannerTitle` — required short message (single line; truncates at narrow widths).
- `PageBannerAction` — optional inline CTA. Sits after the title on the same line.

An optional inline icon is passed as a direct `<svg>` child (Tabler, ~16px), rendered before the title.

## Usage guidelines

PageBanner is consumed by `AppShell` via its `banner` prop — never place a `PageBanner` anywhere else in a page.

Use PageBanner for announcements that apply to the entire application: new features rolling out, scheduled downtime, compliance notices, holiday schedules.

**Don't use PageBanner** for page-specific callouts — use `InlineBanner`. **Don't use PageBanner** for section-level messages — use `Alert`. **Don't use PageBanner** for transient confirmations — use `Sonner`.

## Best practices

**Do:** Keep the message to a single short sentence — the banner truncates at narrow viewports.

**Do:** Use `onDismiss` for promotional and informational banners; omit it for downtime and compliance banners where the user must not be able to hide the message.

**Do:** Pair `variant` with a matching Tabler icon.

**Don't:** Render more than one PageBanner at a time. If multiple app-level conditions need surfacing, rank and show the highest-priority one.

## Writing

- **Title:** one short sentence, sentence case, with terminal punctuation. "New: AI-assisted search is now available on all accounts."
- Prefer declarative phrasing over imperative.

## Quality checklist

- [x] Accessibility: `role="status"` on the root; dismiss button has `aria-label`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: full-width, single-line with ellipsis at narrow widths.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
