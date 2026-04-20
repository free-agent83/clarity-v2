---
name: Typography
slug: typography
version: 0.1.0
status: unstable
lastUpdated: 2026-04-20
---

# Typography

Renders text at one of the design system's role presets.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "body1" \| "body1Emphasis" \| "body2" \| "body2Emphasis" \| "caption" \| "captionEmphasis"` | `"body2"` | Role preset. Drives font-size, line-height, font-weight and letter-spacing together. |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span" \| "div"` | resolved from `variant` | Override the rendered HTML element. Headings default to their matching tag; body and caption variants default to `<p>`. |
| `asChild` | `boolean` | `false` | Render via Radix Slot to apply typography styling to a consumer-provided element (e.g. an anchor or a Next.js `<Link>`). Takes precedence over `as`. |

All standard HTML attributes for the rendered element are supported via prop spread.

## Usage guidelines

Use Typography whenever you need to render a run of text at one of the system's named roles. Pick the variant that matches the role — "is this a page title?" → `h1`, "is this a caption under a form field?" → `caption` — and let the component pick the HTML element for you.

When the visual weight shouldn't imply document structure (a display-sized number in a dashboard card where the card itself already has an `h2` heading), pass `as` to choose a non-semantic element while keeping the style.

When Typography needs to style a consumer-provided element — an anchor, a Next.js `<Link>`, a router link — use `asChild`. The Link atom will consume Typography this way once it lands; styling overrides for link states (underline, hover, visited) belong to Link, not Typography.

Typography does not provide a colour prop or default margins. Colour inherits from ambient context (`text-foreground` set on `<body>` in `globals.css`); spacing composes via the parent (`flex gap-*`, `space-y-*`).

## Best practices

- **Do:** Pick the `variant` that matches the role, not the size. "Is this a page title?" → `h1`. "Is this a caption under a form field?" → `caption`.
- **Do:** Use `as` when the visual weight shouldn't imply document structure — e.g. a display-sized number in a dashboard card where the card itself already has an `h2` heading.
- **Do:** Override colour via `className="text-muted-foreground"` (or similar) when the surrounding context doesn't already set the right colour.
- **Don't:** Use `text-typography-*` utilities directly in application code. They're an implementation detail of this component — callers should go through Typography.
- **Don't:** Put a click handler on Typography or wrap it around an anchor without `asChild`. For interactive text, use the Link atom (once available) or a Button with `variant="link"`.
- **Don't:** Reach for margins on Typography. Spacing is the parent's concern.

## Quality checklist

- [ ] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: no breakpoint-dependent behaviour
- [x] Tokens only: all values flow through `text-typography-*` utilities defined in `globals.css`

## Notes

- The `text-typography-*` theme utilities are defined in `packages/components/src/styles/globals.css` using Tailwind v4's `--text-*` modifier convention. Each entry applies font-size, line-height, font-weight and letter-spacing as a single utility.
- `packages/tokens/src/typography.tokens.json` is knowingly stale relative to the DSW Web Components Figma file and is **not** consumed by this component. Aligning the tokens package is tracked separately.
- Link and Dashed Link treatments from the Figma "Theme Styles" frame are out of scope here. They belong to a future Link atom that will compose Typography.
