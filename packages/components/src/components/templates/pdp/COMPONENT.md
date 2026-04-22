---
name: PDP (Product Detail Page)
slug: pdp
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# PDP (Product Detail Page)

A composition kit for building category-specific Product Detail Pages. Like the PLP kit, no single `<PDP>` component is exported — consumers assemble category PDPs from these primitives and reference the assembly example in their own code.

## Props

Each primitive has its own props interface defined in [`pdp-types.ts`](./pdp-types.ts). This table covers the kit's major primitives:

| Component | Key props |
|---|---|
| [`PdpLayout`](./pdp-layout.tsx) | `media`, `body`, `children?`, `stickyTop?` |
| [`PdpMediaGallery`](./pdp-media-gallery.tsx) | `media: ProductMedia[]`, `onMediaClick?` |
| [`PdpHeading`](./pdp-heading.tsx) | `name`, `sku?` |
| [`PdpPrice`](./pdp-price.tsx) | `amount`, `currency`, `label?`, `perCarat?`, `discount?`, `includeTariffs?`, `legacy?`, `alternateCurrency?`, `showAlternateCurrency?` |
| [`PdpVariantSelector`](./pdp-variant-selector.tsx) | `label`, `children` |
| [`PdpPrimaryAction`](./pdp-primary-action.tsx) | `children` (CTA), `secondaryActions?` |
| [`PdpDelivery`](./pdp-delivery.tsx) | `variant: "express" \| "regular"`, `date`, `shipsFrom?` |
| [`PdpReturns`](./pdp-returns.tsx) | `variant: "returnable" \| "non-returnable"`, `returnsWindow?`, `policyLink?` |
| [`PdpSpecifications`](./pdp-specifications.tsx) | `rows: PdpSpecificationRow[]`, `heading?`, `description?` |

**System-wide:** [`Lightbox`](../../molecules/lightbox/lightbox.tsx) — `media: ProductMedia[]`, `initialIndex?`, `onClose`

## Usage guidelines

**When to use:** Any product detail page in the system. Use what applies to your category — omit what doesn't (e.g. `PdpVariantSelector` for products without variants; `PdpPrice.perCarat` only for stone products).

**When NOT to use:** Do not wrap these primitives in a monolithic component that hides them. The composability is the point — each consumer PDP is a composition, not a config object passed to a single component.

## Assembly reference

The canonical assembly is in [`pdp.stories.tsx`](./pdp.stories.tsx) — a complete `TennisBraceletPDP` showing how all primitives compose. Copy this pattern and adapt it for your category.

```tsx
// Pattern: consumer PDP composition
function TennisBraceletPDP() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  return (
    <>
      <PdpLayout
        stickyTop="64px"
        media={<PdpMediaGallery media={product.media} onMediaClick={setLightboxIndex} />}
        body={<div className="flex flex-col gap-6">
          <PdpHeading name={product.name} sku={product.sku} />
          <PdpPrice amount={product.price} currency="USD" />
          {/* ... more primitives */}
        </div>}
      >
        <PdpSpecifications rows={product.specs} description={product.description} />
      </PdpLayout>
      {lightboxIndex !== null && (
        <Lightbox media={product.media} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
```

## Best practices

**Do:** Let consumers own all state — variant selection, Lightbox open/close, cart handlers.

**Do:** Use `PdpLayout`'s `stickyTop` prop to clear your app's fixed header height.

**Do:** Pass images first in the `media` array; put the video360 last.

**Don't:** Import these primitives in `src/index.ts` — they are not part of the public barrel yet.

## Quality checklist

- [x] Accessible: H1 for product name (`PdpHeading`), fieldset/legend for `PdpVariantSelector`, `role="dialog"` on `Lightbox`
- [x] Responsive: `PdpLayout` stacks mobile; `PdpSpecifications` is flex-based (works at all sizes)
- [x] Tokens only — no hardcoded visual values
- [x] 360° scrub: hover-only in gallery, always visible in `Lightbox`
- [x] TypeScript: zero `tsc --noEmit` errors
