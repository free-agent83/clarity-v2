# Typography component — design spec

**Date:** 2026-04-20
**Status:** Approved for implementation
**Owner:** Design (Chris, via @joao)
**Location:** `packages/components/src/components/atoms/typography/`

## Context

Clarity V2 has no text-role component yet. Consumers currently write Tailwind font utilities ad-hoc, which defeats the "components ARE the design" principle from `VISION.md`. This spec adds a `Typography` atom that renders text at one of a fixed set of role presets pulled directly from the DSW Web Components Figma file (`RWnWNT9nWID1Wl6Py56Xai`, node `18422:14` "Theme Styles").

### Source of truth

The Figma "Theme Styles" frame is the source of truth. `packages/tokens/src/typography.tokens.json` is stale relative to this frame and is **not touched by this spec**. The component instead consumes its values from theme-layer CSS variables added to `packages/components/src/styles/globals.css`.

Link and Dashed Link treatments in the Figma frame are **out of scope**: they belong to a future `Link` atom that will compose `Typography`. Button label styling is also out of scope per the same principle — Button owns its own label styling.

## Extracted Figma values (source of truth)

Family: **Inter** throughout.

| Variant | Font size | Line-height | Font weight | Letter-spacing |
|---|---|---|---|---|
| `h1` | 96px | 112px | 300 | -1.5px |
| `h2` | 60px | 72px | 300 | -0.5px |
| `h3` | 48px | 56px | 500 | 0 |
| `h4` | 34px | 42px | 500 | 0.25px |
| `h5` | 24px | 32px | 500 | 0 |
| `h6` | 20px | 32px | 500 | 0.15px |
| `body1` | 16px | 24px | 400 | 0.15px |
| `body1Emphasis` | 16px | 24px | 500 | 0.15px |
| `body2` | 14px | 20px | 400 | 0.15px |
| `body2Emphasis` | 14px | 20px | 500 | 0.15px |
| `caption` | 12px | 20px | 400 | 0.4px |
| `captionEmphasis` | 12px | 20px | 500 | 0.4px |

Sub-pixel line-heights in Figma (20.02px for body 2, 19.92px for caption) are rounded to 20px in code — likely Figma artefacts; the difference is imperceptible.

## Theme-layer additions (`globals.css`)

Added to the existing `@theme inline { ... }` block as a new labelled section below the color mappings. Uses Tailwind v4's `--text-*` modifier convention so each entry emits a single `text-typography-{role}` utility that applies font-size, line-height, font-weight and letter-spacing together.

Naming convention: `--text-typography-{role}` — the `typography-` infix disambiguates role presets from primitive sizes like `--text-lg`. This introduces a new local convention in `globals.css`; future role utilities should follow the same `<category>-<role>` pattern.

```css
@theme inline {
  /* …existing entries… */

  /**
   * Typography role presets
   * Each entry emits a `text-typography-{role}` utility that applies
   * font-size, line-height, font-weight, and letter-spacing together.
   * Consumed by the Typography component. Do not use these utilities
   * directly in application code — use the Typography component.
   */
  --text-typography-h1: 96px;
  --text-typography-h1--line-height: 112px;
  --text-typography-h1--font-weight: 300;
  --text-typography-h1--letter-spacing: -1.5px;

  --text-typography-h2: 60px;
  --text-typography-h2--line-height: 72px;
  --text-typography-h2--font-weight: 300;
  --text-typography-h2--letter-spacing: -0.5px;

  --text-typography-h3: 48px;
  --text-typography-h3--line-height: 56px;
  --text-typography-h3--font-weight: 500;
  --text-typography-h3--letter-spacing: 0px;

  --text-typography-h4: 34px;
  --text-typography-h4--line-height: 42px;
  --text-typography-h4--font-weight: 500;
  --text-typography-h4--letter-spacing: 0.25px;

  --text-typography-h5: 24px;
  --text-typography-h5--line-height: 32px;
  --text-typography-h5--font-weight: 500;
  --text-typography-h5--letter-spacing: 0px;

  --text-typography-h6: 20px;
  --text-typography-h6--line-height: 32px;
  --text-typography-h6--font-weight: 500;
  --text-typography-h6--letter-spacing: 0.15px;

  --text-typography-body-1: 16px;
  --text-typography-body-1--line-height: 24px;
  --text-typography-body-1--font-weight: 400;
  --text-typography-body-1--letter-spacing: 0.15px;

  --text-typography-body-1-emphasis: 16px;
  --text-typography-body-1-emphasis--line-height: 24px;
  --text-typography-body-1-emphasis--font-weight: 500;
  --text-typography-body-1-emphasis--letter-spacing: 0.15px;

  --text-typography-body-2: 14px;
  --text-typography-body-2--line-height: 20px;
  --text-typography-body-2--font-weight: 400;
  --text-typography-body-2--letter-spacing: 0.15px;

  --text-typography-body-2-emphasis: 14px;
  --text-typography-body-2-emphasis--line-height: 20px;
  --text-typography-body-2-emphasis--font-weight: 500;
  --text-typography-body-2-emphasis--letter-spacing: 0.15px;

  --text-typography-caption: 12px;
  --text-typography-caption--line-height: 20px;
  --text-typography-caption--font-weight: 400;
  --text-typography-caption--letter-spacing: 0.4px;

  --text-typography-caption-emphasis: 12px;
  --text-typography-caption-emphasis--line-height: 20px;
  --text-typography-caption-emphasis--font-weight: 500;
  --text-typography-caption-emphasis--letter-spacing: 0.4px;
}
```

Rule 3 of the token-consumption policy (`CONTRIBUTING.md`) requires design-lead sign-off for theme-layer edits. This spec itself constitutes that ratification.

## Component API

```tsx
type TypographyVariant =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "body1" | "body1Emphasis"
  | "body2" | "body2Emphasis"
  | "caption" | "captionEmphasis";

type TypographyElement =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "span" | "div";

interface TypographyProps
  extends Omit<React.ComponentProps<"p">, "color">,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
  asChild?: boolean;
}
```

### Variant → default element mapping

| Variant | Default element |
|---|---|
| `h1`–`h6` | matching `<h1>`–`<h6>` |
| `body1`, `body1Emphasis`, `body2`, `body2Emphasis`, `caption`, `captionEmphasis` | `<p>` |

### Defaults

- `defaultVariants: { variant: "body2" }` — the library errs on the side of compactness.
- No default `as` — the rendered element is resolved from `variant` at render time.
- `asChild` takes precedence over `as` when both are set.

### Deliberate non-features

- **No colour prop.** Colour is inherited from ambient context (`<body>` gets `text-foreground` via `globals.css`). Consumers use `className="text-muted-foreground"` (or similar) when the surrounding context doesn't already set the right colour. The deprecated HTML `color` attribute is `Omit`'d from the prop extension.
- **No margin defaults.** Spacing composes via the parent (`flex gap-*`, `space-y-*`). Headings-with-built-in-margins is a `prose` concern, not a component-library concern.
- **No truncation or `lines` props.** Consumers pass `className="truncate"` / `className="line-clamp-2"` when needed.
- **No separate emphasis axis.** The twelve variants mirror the Figma style names 1:1; emphasis is not a boolean because it doesn't apply to headings.

## Implementation

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Typography variants.
 *
 * Variant axis = role preset (h1–h6, body1, body1Emphasis, body2, body2Emphasis, caption, captionEmphasis)
 *
 * Each variant maps 1:1 to a `text-typography-*` utility defined in globals.css,
 * which in turn applies font-size, line-height, font-weight and letter-spacing
 * together. See globals.css → "Typography role presets".
 */
const typographyVariants = cva("font-sans", {
  variants: {
    variant: {
      h1: "text-typography-h1",
      h2: "text-typography-h2",
      h3: "text-typography-h3",
      h4: "text-typography-h4",
      h5: "text-typography-h5",
      h6: "text-typography-h6",
      body1: "text-typography-body-1",
      body1Emphasis: "text-typography-body-1-emphasis",
      body2: "text-typography-body-2",
      body2Emphasis: "text-typography-body-2-emphasis",
      caption: "text-typography-caption",
      captionEmphasis: "text-typography-caption-emphasis",
    },
  },
  defaultVariants: {
    variant: "body2",
  },
})

const defaultElementByVariant = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  body1: "p", body1Emphasis: "p",
  body2: "p", body2Emphasis: "p",
  caption: "p", captionEmphasis: "p",
} as const

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"

interface TypographyProps
  extends Omit<React.ComponentProps<"p">, "color">,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement
  asChild?: boolean
}

/**
 * Renders text at one of the design system's role presets.
 *
 * Pick the `variant` that matches the role ("is this a page title? a
 * caption under a form field?"). The component picks a sensible HTML
 * element for that role (`h1`–`h6` render their matching heading tag,
 * body and caption variants render `<p>`); pass `as` to override when
 * the visual weight shouldn't imply document structure. Pass `asChild`
 * to render via Radix Slot — e.g. to style a Next.js `<Link>` as body
 * text — in which case `as` is ignored.
 *
 * Colour is inherited from ambient context; no colour prop is provided.
 * Use `className="text-muted-foreground"` (or similar) when the
 * surrounding context doesn't already set the right colour.
 *
 * @see {@link typographyVariants} for the full variant list.
 */
function Typography({
  className,
  variant = "body2",
  as,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild ? Slot.Root : (as ?? defaultElementByVariant[variant!])

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
export type { TypographyProps }
```

Base class `font-sans` sets the family once (Inter) rather than repeating across twelve variants; family is not part of the `--text-*` modifier set in Tailwind v4.

## File layout

```
packages/components/src/components/atoms/typography/
├── typography.tsx
├── typography.stories.tsx
└── COMPONENT.md
```

No standalone `typography.test.tsx` — the logic is trivial (variant→element lookup plus `cn`). Stories + a11y addon + render tests cover it per `CONTRIBUTING.md` testing strategy.

## Barrel export

Added to `packages/components/src/index.ts`:

```ts
export { Typography, typographyVariants } from "./components/atoms/typography/typography";
export type { TypographyProps } from "./components/atoms/typography/typography";
```

## Storybook

Sidebar title: `Foundations/Typography` (matches the `Foundations/` taxonomy from `CONTRIBUTING.md`).

### Stories

1. **`Default`** — argTypes playground anchor. Renders with default variant (`body2`) and a short string.
2. **`Specimen`** — all 12 variants rendered top-to-bottom with the variant name as a label. Mirrors the Figma "Theme Styles" frame. The at-a-glance reference for "what text does this system produce".
3. **`AsOverride`** — demonstrates `<Typography variant="h1" as="div">`. The `as` pattern isn't discoverable from argTypes since `as` accepts several values and its interaction with `variant` is non-obvious.
4. **`AsChildWithLink`** — demonstrates `<Typography variant="body1" asChild><a href="…">…</a></Typography>`. Doubles as the worked example of how a future `Link` atom will compose `Typography`.

### argTypes

```ts
argTypes: {
  variant: {
    control: "select",
    options: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "body1", "body1Emphasis",
      "body2", "body2Emphasis",
      "caption", "captionEmphasis",
    ],
  },
  as: {
    control: "select",
    options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"],
  },
  asChild: { control: "boolean" },
}
```

No `play` functions — Typography is non-interactive. Accessibility coverage via the a11y addon.

## COMPONENT.md

Required per `CONTRIBUTING.md`. Frontmatter: `name: Typography`, `slug: typography`, `version: 0.1.0`, `status: unstable`, `lastUpdated: 2026-04-20`. Sections follow the standard template (props table, usage, best practices, quality checklist). No "Writing" section — Typography is role-agnostic; writing guidance lives on the components that render specific copy (Button labels, Alert titles, etc.).

Best-practice entries to include:

- **Do:** Pick the `variant` that matches the role, not the size. "Is this a page title?" → `h1`. "Is this a caption under a form field?" → `caption`.
- **Do:** Use `as` when the visual weight shouldn't imply document structure — e.g. a display-sized number in a dashboard card where the card itself already has an `h2` heading.
- **Don't:** Use `text-typography-*` utilities directly in application code. They're an implementation detail of this component.
- **Don't:** Pass colour via a prop — there isn't one. Set colour via `className` or ambient context.

## Definition of done

From `CONTRIBUTING.md`, applied to this component:

- [ ] `typography.tsx` implemented per this spec
- [ ] Theme-layer additions landed in `globals.css`
- [ ] `typography.stories.tsx` with `tags: ["autodocs"]`, the four stories above, and the argTypes block
- [ ] `COMPONENT.md` per the standard template
- [ ] Barrel export added to `src/index.ts`
- [ ] Storybook renders all stories without errors; a11y addon shows no violations
- [ ] `tsc --noEmit` passes

No token-gap flags expected — all values come from `var(--text-typography-*)` utilities defined in `globals.css`.

## Out of scope (explicit)

- Any edits to `packages/tokens/src/typography.tokens.json`. The tokens package is knowingly stale relative to Figma; aligning it is tracked separately.
- `Link` and `Dashed Link` treatments from the Figma frame. Owned by a future `Link` atom that will compose `Typography`.
- Button label styling. Owned by Button.
- Dark-mode colour adjustments beyond the ambient `text-foreground` inheritance already provided by `globals.css`.
