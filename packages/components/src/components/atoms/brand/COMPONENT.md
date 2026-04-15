---
name: Brand
slug: brand
version: 0.0.1
status: stable
lastUpdated: 2026-04-15
---

# Brand

The Nivoda brand mark, rendered as an inline SVG. Foundational — it
represents the company itself, not a generic UI primitive, and
should be treated as part of the design system's identity layer
alongside colour and typography tokens.

## Props

Extends `React.ComponentProps<"svg">` — all native SVG props are
passed through. The component takes no component-specific props;
sizing, colour, and accessibility behaviour are controlled through
standard SVG / Tailwind mechanisms documented below.

## Sizing

The brand is resized via Tailwind height utilities on `className`.
Width scales automatically with the SVG's viewBox aspect ratio so
the mark always stays proportional.

```tsx
<Brand />                  // 24px tall — the default
<Brand className="h-10" /> // 40px tall
<Brand className="h-16" /> // 64px tall
```

There is deliberately no `size` prop. Any Tailwind height utility
works, which keeps the API surface zero and lets consumers size the
mark against the same scale they use for everything else in the
shell.

## Colour

The SVG paths use `fill="currentColor"`, so the brand inherits the
ambient text colour of its parent. This means:

- It renders as the current theme's foreground on both light and
  dark backgrounds without any variant prop.
- It can be recoloured by applying a `text-*` utility: `<Brand
  className="h-10 text-primary" />`.
- Placing it inside an inverted surface (e.g. a dark hero) works
  for free as long as the surface sets its own `text-*` class.

## Accessibility

The component defaults to `role="img"` and `aria-label="Nivoda"`, so
assistive technology announces the mark by name.

**Decorative use:** when the brand sits next to a visible "Nivoda"
wordmark or any other representation of the company name, pass
`aria-hidden` to mark it decorative. This avoids duplicate
announcements.

```tsx
<div className="flex items-center gap-2">
  <Brand className="h-6" aria-hidden />
  <span className="font-heading font-semibold">Nivoda</span>
</div>
```

## Usage guidelines

**Use for** the canonical Nivoda brand mark anywhere it's needed:
app shell headers, navigation sheets, auth screens, marketing
surfaces, email templates rendered through the component library.

**Do not** recolour the brand outside a small set of sanctioned
cases (foreground/inverted surfaces, monochrome tinting into
primary). Brand recolouring is a design ruling — flag novel uses
with the design lead before shipping.

**Do not** reproduce the brand with inline SVG elsewhere in the
codebase. Import `Brand` instead so the single source of truth stays
authoritative.

## Best practices

**Do:** Size the brand with Tailwind height utilities on
`className`. Width handles itself.

**Do:** Let the brand inherit colour from its surrounding context.
The default `currentColor` fill is almost always what you want.

**Don't:** Pass `width` or `height` as SVG attributes. Use
`className` height utilities instead — they keep the brand aligned
with the spacing scale and make responsive sizing straightforward.

**Don't:** Wrap the brand in an extra `<div>` just to set its
colour. Apply the `text-*` class directly to the `Brand` element.

## Quality checklist

- [x] Accessibility: `role="img"` + `aria-label` default; overridable to `aria-hidden` for decorative use
- [ ] Responsive: works at all breakpoints (via consumer-controlled height utilities)
- [x] Tokens only: no hardcoded visual values (colour via `currentColor`, size via spacing utilities)
