# PDP Template — Design Spec

**Date:** 2026-04-22
**Author:** João Gomes, with AI assistance
**Status:** Draft — pending review

---

## 1. Purpose and scope

This document specifies the architecture for the Product Detail Page (PDP) template system in Clarity V2.

The PDP kit follows the same philosophy as the PLP kit: **we do not ship a monolithic `<TemplatePDP>` component**. We ship a subpackage of composable primitives that consumers assemble into category-specific PDPs (e.g. `<TennisBraceletPDP>`, `<DiamondPDP>`). Each category PDP is a consumer-owned composition; the design system provides the building blocks.

**What this document covers:**

- The full primitive inventory and where each component lives
- Each primitive's responsibility, props interface, and behaviour
- Cross-cutting concerns: responsive behaviour, accessibility

**What this document does not cover:**

- Visual design, spacing, typography, colour — those are token decisions
- Per-category implementations
- Routing, data fetching, state management — consumer concerns

---

## 2. Primitive inventory

The PDP kit lives at `packages/components/src/components/templates/pdp/`. One exception: `Lightbox` is a system-wide component that lives at `packages/components/src/components/molecules/lightbox/`.

| Primitive | Path | Role |
|---|---|---|
| `PdpLayout` | `templates/pdp/pdp-layout.tsx` | Two-column shell — media (sticky left), body (scrolling right), full-width below |
| `PdpMediaGallery` | `templates/pdp/pdp-media-gallery.tsx` | Thumbnail strip + main image + 360° scrub + Lightbox trigger |
| `PdpHeading` | `templates/pdp/pdp-heading.tsx` | Product name (H1) + SKU subtitle |
| `PdpPrice` | `templates/pdp/pdp-price.tsx` | Full pricing matrix |
| `PdpVariantSelector` | `templates/pdp/pdp-variant-selector.tsx` | Label + container shell for variant controls |
| `PdpPrimaryAction` | `templates/pdp/pdp-primary-action.tsx` | Full-width CTA area + secondary actions zone |
| `PdpDelivery` | `templates/pdp/pdp-delivery.tsx` | Delivery timeline display |
| `PdpReturns` | `templates/pdp/pdp-returns.tsx` | Returns policy display |
| `PdpSpecifications` | `templates/pdp/pdp-specifications.tsx` | Key-value spec table |
| `PdpDescription` | `templates/pdp/pdp-description.tsx` | Freeform description text block |
| `Lightbox` *(shared)* | `molecules/lightbox/lightbox.tsx` | Full-screen media viewer with zoom and 360° scrub |

---

## 3. PdpLayout

The layout shell. Dumb CSS, no logic, no state. Its only job is to place its slots correctly.

**Behaviour:**
- Two-column split at a fixed 50/50 ratio. Consumers who need a different split own that layout themselves.
- Left column (`media`) is `position: sticky` — it stays anchored to the top of the viewport as the user scrolls the body column.
- Right column (`body`) scrolls naturally.
- `children` renders below both columns at full width. No structural opinion on order — consumers control what appears there and in what order.

```tsx
interface PdpLayoutProps {
  media: ReactNode       // Left column — sticky
  body: ReactNode        // Right column — scrolls
  children?: ReactNode   // Below fold — full width, consumer-ordered
  stickyTop?: string     // CSS value for sticky offset, default "0px"
                         // Set this to clear the app's fixed header height
  className?: string
}
```

---

## 4. PdpMediaGallery

Renders a vertical thumbnail strip on the left and a main view on the right. Manages which thumbnail is selected and what the main view shows. Fires an `onMediaClick` callback when the user clicks the main view — the consumer is responsible for opening `Lightbox`.

**Media types:**

```tsx
type ProductMedia =
  | { type: "image"; src: string; alt: string; thumbnailSrc?: string }
  | { type: "video360"; src: string; poster?: string }
```

The same `ProductMedia[]` array is passed to both `PdpMediaGallery` and `Lightbox` — no translation needed at the consumer level.

**Interactions — desktop:**

- Clicking a thumbnail swaps the main view.
- **Static image selected:** `cursor: zoom-in`. Clicking fires `onMediaClick(index)`.
- **360° thumbnail selected:** the main view shows the video. On hover, a scrub bar appears at the bottom of the main view — the user drags the scrub bar thumb left/right to rotate. Clicking anywhere on the video surface fires `onMediaClick(index)` with the video's index, opening Lightbox with the 360° view selected.
- The video surface itself is not directly draggable — rotation is only via the scrub bar thumb.

**Interactions — mobile:**

- No scrub bar anywhere on the gallery.
- Tapping any thumbnail or the main view fires `onMediaClick(index)`, opening Lightbox. Rotation via scrub bar is only available inside Lightbox.

```tsx
interface PdpMediaGalleryProps {
  media: ProductMedia[]            // Images first; video360 last if present
  onMediaClick?: (index: number) => void
  className?: string
}
```

**Lightbox wiring pattern:**

```tsx
const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

<PdpMediaGallery
  media={product.media}
  onMediaClick={setLightboxIndex}
/>

{lightboxIndex !== null && (
  <Lightbox
    media={product.media}
    initialIndex={lightboxIndex}
    onClose={() => setLightboxIndex(null)}
  />
)}
```

---

## 5. Lightbox (system-wide)

Full-screen media viewer. Lives in `molecules/lightbox/` — not PDP-specific. Any component in the system can use it.

Supports two media types from the shared `ProductMedia` union:

- **Image:** displays the image with pinch/scroll zoom.
- **Video360:** displays the video with a scrub bar always visible (desktop and mobile). Dragging the scrub thumb rotates the video.

Navigation between items uses prev/next controls and indicator dots.

```tsx
interface LightboxProps {
  media: ProductMedia[]
  initialIndex?: number    // default: 0
  onClose: () => void
}
```

---

## 6. Info panel primitives

These primitives are composed inside `PdpLayout`'s `body` slot. The order is consumer-controlled; the wireframe order (Heading → Price → VariantSelector → PrimaryAction → Delivery → Returns) is a convention, not enforced.

### PdpHeading

Product name rendered as H1, with optional SKU as a caption below.

```tsx
interface PdpHeadingProps {
  name: string
  sku?: string
  className?: string
}
```

### PdpPrice

Full pricing matrix. Supports all pricing scenarios across all product categories.

```tsx
interface PdpPriceProps {
  amount: number
  currency: string
  label?: string                              // e.g. "Final delivered price"

  // Stone pricing
  perCarat?: { amount: number; currency: string }
  discount?: { percentage: number; originalAmount: number }
  includeTariffs?: boolean

  // Legacy pricing — amount is item price (primary, large), delivered price is secondary
  // Mutually exclusive with discount
  legacy?: { deliveredAmount: number; deliveredCurrency: string }

  // Alternate currency — available for all variants; boolean toggles display
  alternateCurrency?: { amount: number; currency: string }
  showAlternateCurrency?: boolean             // default: true

  className?: string
}
```

**Rendering rules:**

| Scenario | Primary display | Secondary lines |
|---|---|---|
| Simple | `label` (caption) → `amount` | alt currency (if enabled) |
| Per-carat | `amount` → `/ ct` rate | alt currency |
| Discount | badge + struck-through original → `amount` | alt currency |
| Incl. tariffs | tariff note with flag + help icon → `amount` | alt currency |
| Legacy | `amount` (item price, large) → "Delivered: X" (caption) | alt currency |
| Any combination | combine above rules in order | alt currency always last |

`legacy` and `discount` are mutually exclusive — a legacy item price does not carry a strike-through.

`showAlternateCurrency: false` suppresses the alternate currency line even when `alternateCurrency` data is present.

### PdpVariantSelector

A label and container shell for variant controls. The consumer provides the actual controls (a `ToggleGroup`, `RadioGroup`, etc.). Disabled/out-of-stock states are the consumer's responsibility via their control's disabled prop.

```tsx
interface PdpVariantSelectorProps {
  label: string          // e.g. "Size" — rendered above the controls
  children: ReactNode    // Consumer's ToggleGroup, RadioGroup, etc.
  className?: string
}
```

Categories without variants (e.g. loose diamonds) simply omit this primitive.

### PdpPrimaryAction

Full-width CTA area. The consumer provides the `<Button>` — this primitive enforces full-width layout and provides a secondary actions zone for shortlist, share, and similar affordances.

```tsx
interface PdpPrimaryActionProps {
  children: ReactNode          // Main CTA — consumer's Button, renders full-width
  secondaryActions?: ReactNode // Shortlist button, share icon, etc.
  className?: string
}
```

### PdpDelivery

Same props interface as `PlpGridItemDelivery`, rendered at PDP density (more verbose, less compact).

```tsx
interface PdpDeliveryProps {
  variant: "express" | "regular"
  date: ReactNode              // e.g. "Nov 18–23" or "15 business days"
  shipsFrom?: ReactNode
  className?: string
}
```

### PdpReturns

Same variant axis as `PlpGridItemReturnable`, with additional PDP-specific fields for the returns window and policy link.

```tsx
interface PdpReturnsProps {
  variant: "returnable" | "non-returnable"
  returnsWindow?: ReactNode    // e.g. "14 days" — only shown for returnable
  policyLink?: ReactNode       // e.g. <a href="...">Returns Policy</a>
  className?: string
}
```

---

## 7. Below-fold primitives

Rendered inside `PdpLayout`'s `children` zone. Consumer controls order and may add further content (related products, Q&A, reviews) between or after these.

### PdpSpecifications

A two-column key-value table. Consumer provides all rows; values are `ReactNode` so badges, links, and formatted strings all work.

```tsx
interface PdpSpecificationRow {
  label: string
  value: ReactNode
}

interface PdpSpecificationsProps {
  rows: PdpSpecificationRow[]
  heading?: string             // default: "Specifications"
  className?: string
}
```

### PdpDescription

A typography wrapper for freeform product description. No opinion on content format — raw strings, CMS output, and rich HTML are all valid as children.

```tsx
interface PdpDescriptionProps {
  children: ReactNode
  className?: string
}
```

---

## 8. Responsive behaviour

| Primitive | Mobile behaviour |
|---|---|
| `PdpLayout` | Stacks to single column: media above, body below, children after |
| `PdpMediaGallery` | Thumbnail strip becomes horizontal row below the main image |
| `PdpMediaGallery` (360°) | No scrub bar — tap opens Lightbox where scrub is available |
| `PdpPrice` | No change — all variants render the same |
| `PdpSpecifications` | Single-column stacked label + value (label as caption above value) |

---

## 9. Data slots — what the design system owns vs. consumers

The PDP kit is stateless with respect to data fetching, routing, and application state. Consumers own:

- Fetching and supplying product data
- Routing (breadcrumbs, back navigation)
- Cart interactions (add-to-cart handler, loading/error states on the CTA)
- Variant selection state
- Lightbox open/close state

The design system owns:

- Rendering primitives correctly given the props it receives
- Visual consistency across all category PDPs that use the kit
- Accessibility semantics within each primitive

---

## 10. Open questions

- **Breadcrumbs:** The wireframe shows a breadcrumb trail. Should `PdpBreadcrumbs` be a dedicated PDP primitive, or should consumers reuse an existing `Breadcrumbs` molecule if one exists? To be decided when the shared `Breadcrumbs` molecule spec is complete.
- **Certificate viewer:** Diamonds and some coloured stones carry grading certificates (GIA, IGI). A `PdpCertificate` primitive or Lightbox extension may be needed. Out of scope for this iteration — flagged for follow-up.
- **`PdpDelivery` / `PdpReturns` shared with PLP:** Once both PLP and PDP primitives exist, extracting these to a shared `product-primitives` module (same props, context-aware rendering) is worth revisiting. Deferred to avoid premature abstraction.
