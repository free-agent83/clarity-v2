# PDP Template Kit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PDP template kit — 10 composable primitives at `templates/pdp/` plus a system-wide `Lightbox` at `molecules/lightbox/` — following the same composition philosophy as the PLP template.

**Architecture:** No monolithic PDP component. Consumers assemble their own category PDPs (e.g. `TennisBraceletPDP`) from these primitives. Shared types live in `pdp-types.ts` and are imported by both `PdpMediaGallery` and `Lightbox`. Not exported from `src/index.ts`.

**Tech Stack:** React 18, TypeScript, Tailwind v4, shadcn/ui, Radix UI, Storybook 8, Vitest

---

## File map

| File | Responsibility |
|---|---|
| `molecules/lightbox/lightbox.tsx` | Full-screen media viewer (images + 360° video with scrub bar) |
| `molecules/lightbox/lightbox.stories.tsx` | Lightbox stories |
| `molecules/lightbox/COMPONENT.md` | Lightbox docs |
| `templates/pdp/pdp-types.ts` | Shared `ProductMedia` type + all Props interfaces |
| `templates/pdp/pdp-layout.tsx` | Two-column sticky-left shell |
| `templates/pdp/pdp-layout.stories.tsx` | Layout stories |
| `templates/pdp/pdp-heading.tsx` | Product name H1 + SKU caption |
| `templates/pdp/pdp-heading.stories.tsx` | Heading stories |
| `templates/pdp/pdp-media-gallery.tsx` | Thumbnail strip + main view + 360 scrub bar + Lightbox trigger |
| `templates/pdp/pdp-media-gallery.stories.tsx` | Gallery stories |
| `templates/pdp/pdp-variant-selector.tsx` | Label + fieldset shell for variant controls |
| `templates/pdp/pdp-variant-selector.stories.tsx` | Variant selector stories |
| `templates/pdp/pdp-primary-action.tsx` | Full-width CTA + secondary actions zone |
| `templates/pdp/pdp-primary-action.stories.tsx` | Primary action stories |
| `templates/pdp/pdp-delivery.tsx` | Express / regular delivery display |
| `templates/pdp/pdp-delivery.stories.tsx` | Delivery stories |
| `templates/pdp/pdp-returns.tsx` | Returnable / non-returnable display |
| `templates/pdp/pdp-returns.stories.tsx` | Returns stories |
| `templates/pdp/pdp-price.tsx` | Full pricing matrix (6 scenarios) |
| `templates/pdp/pdp-price.stories.tsx` | Price stories |
| `templates/pdp/pdp-specifications.tsx` | Key-value spec table |
| `templates/pdp/pdp-specifications.stories.tsx` | Specifications stories |
| `templates/pdp/pdp-description.tsx` | Freeform description wrapper |
| `templates/pdp/pdp-description.stories.tsx` | Description stories |
| `templates/pdp/pdp.stories.tsx` | Meta-story: full TennisBracelet assembly reference |
| `templates/pdp/COMPONENT.md` | PDP kit docs |

All paths are relative to `packages/components/src/components/`. `src/index.ts` is **not** modified.

---

## Task 1: Shared types

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-types.ts`

- [ ] **Step 1.1: Create the types file**

```typescript
// packages/components/src/components/templates/pdp/pdp-types.ts
import type { ReactNode } from "react";

// ── Media ─────────────────────────────────────────────────

export type ProductMedia =
  | { type: "image"; src: string; alt: string; thumbnailSrc?: string }
  | { type: "video360"; src: string; poster?: string };

// ── Layout ────────────────────────────────────────────────

export interface PdpLayoutProps {
  media: ReactNode;
  body: ReactNode;
  children?: ReactNode;
  stickyTop?: string;
  className?: string;
}

// ── Heading ───────────────────────────────────────────────

export interface PdpHeadingProps {
  name: string;
  sku?: string;
  className?: string;
}

// ── Media gallery ─────────────────────────────────────────

export interface PdpMediaGalleryProps {
  media: ProductMedia[];
  onMediaClick?: (index: number) => void;
  className?: string;
}

// ── Price ─────────────────────────────────────────────────

export interface PdpPriceProps {
  amount: number;
  currency: string;
  label?: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  includeTariffs?: boolean;
  /** amount = item price (primary, large); deliveredAmount is shown as caption below. Mutually exclusive with discount. */
  legacy?: { deliveredAmount: number; deliveredCurrency: string };
  alternateCurrency?: { amount: number; currency: string };
  showAlternateCurrency?: boolean;
  className?: string;
}

// ── Variant selector ──────────────────────────────────────

export interface PdpVariantSelectorProps {
  label: string;
  children: ReactNode;
  className?: string;
}

// ── Primary action ────────────────────────────────────────

export interface PdpPrimaryActionProps {
  children: ReactNode;
  secondaryActions?: ReactNode;
  className?: string;
}

// ── Delivery ──────────────────────────────────────────────

export interface PdpDeliveryProps {
  variant: "express" | "regular";
  date: ReactNode;
  shipsFrom?: ReactNode;
  className?: string;
}

// ── Returns ───────────────────────────────────────────────

export interface PdpReturnsProps {
  variant: "returnable" | "non-returnable";
  returnsWindow?: ReactNode;
  policyLink?: ReactNode;
  className?: string;
}

// ── Specifications ────────────────────────────────────────

export interface PdpSpecificationRow {
  label: string;
  value: ReactNode;
}

export interface PdpSpecificationsProps {
  rows: PdpSpecificationRow[];
  heading?: string;
  className?: string;
}

// ── Description ───────────────────────────────────────────

export interface PdpDescriptionProps {
  children: ReactNode;
  className?: string;
}

// ── Lightbox ──────────────────────────────────────────────

export interface LightboxProps {
  media: ProductMedia[];
  initialIndex?: number;
  onClose: () => void;
}
```

- [ ] **Step 1.2: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-types.ts
git commit -m "feat(pdp): add shared types for PDP template kit"
```

---

## Task 2: Lightbox

**Files:**
- Create: `packages/components/src/components/molecules/lightbox/lightbox.tsx`
- Create: `packages/components/src/components/molecules/lightbox/lightbox.stories.tsx`
- Create: `packages/components/src/components/molecules/lightbox/COMPONENT.md`

- [ ] **Step 2.1: Write the story**

```tsx
// packages/components/src/components/molecules/lightbox/lightbox.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../atoms/button/button";
import { Lightbox } from "./lightbox";
import type { ProductMedia } from "../../templates/pdp/pdp-types";

const IMAGES: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "Diamond ring", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Jewellery detail", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200" },
  { type: "image", src: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=800", alt: "Gold bracelet", thumbnailSrc: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=200" },
];

const MIXED: ProductMedia[] = [
  ...IMAGES.slice(0, 2),
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200" },
];

function WithTrigger({ media, initialIndex = 0 }: { media: ProductMedia[]; initialIndex?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Lightbox</Button>
      {open && <Lightbox media={media} initialIndex={initialIndex} onClose={() => setOpen(false)} />}
    </>
  );
}

const meta: Meta<typeof Lightbox> = {
  title: "Molecules/Lightbox",
  component: Lightbox,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Lightbox>;

export const WithImages: Story = { render: () => <WithTrigger media={IMAGES} /> };
export const SingleImage: Story = { render: () => <WithTrigger media={[IMAGES[0]]} /> };
export const OpenAtSecondImage: Story = { render: () => <WithTrigger media={IMAGES} initialIndex={1} /> };
export const WithVideo360: Story = { render: () => <WithTrigger media={[MIXED[2]]} /> };
export const MixedMedia: Story = { render: () => <WithTrigger media={MIXED} /> };
export const MixedOpenAtVideo: Story = { render: () => <WithTrigger media={MIXED} initialIndex={2} /> };
```

- [ ] **Step 2.2: Verify story fails (import error — component not yet created)**

```bash
cd packages/components && npx storybook dev -p 6006
```

Navigate to Molecules/Lightbox. Expect import error.

- [ ] **Step 2.3: Implement Lightbox**

```tsx
// packages/components/src/components/molecules/lightbox/lightbox.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { LightboxProps, ProductMedia } from "../../templates/pdp/pdp-types";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function ScrubBar({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [position, setPosition] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPosition(ratio);
    video.currentTime = ratio * video.duration;
  }, [videoRef]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) seekTo(e.clientX); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [seekTo]);

  return (
    <div className="px-6 pb-4 pt-2">
      <p className="mb-2 text-xs uppercase tracking-widest text-white/60">Rotate</p>
      <div
        ref={barRef}
        className="relative h-1 cursor-ew-resize rounded-full bg-white/30"
        onMouseDown={(e) => { dragging.current = true; seekTo(e.clientX); }}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/80" style={{ width: `${position * 100}%` }} />
        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${position * 100}%` }} />
      </div>
    </div>
  );
}

function MediaView({ item }: { item: ProductMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  if (item.type === "video360") {
    return (
      <div className="flex flex-1 flex-col" data-slot="lightbox-video360">
        <div className="flex flex-1 items-center justify-center bg-black">
          <video ref={videoRef} src={item.src} poster={item.poster} className="max-h-full max-w-full" playsInline muted preload="auto" />
        </div>
        <ScrubBar videoRef={videoRef} />
      </div>
    );
  }
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-black" data-slot="lightbox-image">
      <img src={item.src} alt={item.alt} className="max-h-full max-w-full object-contain" draggable={false} />
    </div>
  );
}

/**
 * Full-screen media viewer. Supports static images and 360° video with a
 * scrub bar. System-wide — not PDP-specific.
 */
export function Lightbox({ media, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, media.length - 1)));

  const prev = useCallback(() => setIndex((i) => (i - 1 + media.length) % media.length), [media.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % media.length), [media.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Media lightbox" data-slot="lightbox">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm text-white/60">{index + 1} / {media.length}</span>
        <button className="rounded p-1 text-white hover:bg-white/10" onClick={onClose} aria-label="Close lightbox">
          <IconX size={20} />
        </button>
      </div>
      <MediaView item={media[index]} />
      {media.length > 1 && (
        <>
          <button className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-2 text-white hover:bg-white/10" onClick={prev} aria-label="Previous">
            <IconChevronLeft size={24} />
          </button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-white hover:bg-white/10" onClick={next} aria-label="Next">
            <IconChevronRight size={24} />
          </button>
          <div className="flex shrink-0 justify-center gap-1.5 pb-4">
            {media.map((_, i) => (
              <button key={i} className={cn("h-1.5 w-1.5 rounded-full transition-colors", i === index ? "bg-white" : "bg-white/30")} onClick={() => setIndex(i)} aria-label={`Go to item ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2.4: Verify stories render correctly**

Reload Storybook. Verify:
- `WithImages`: overlay opens, prev/next buttons work, Escape closes, dots update
- `WithVideo360`: video renders with scrub bar, dragging thumb scrubs the video
- `MixedOpenAtVideo`: opens directly on the video frame

- [ ] **Step 2.5: Write COMPONENT.md**

```markdown
---
name: Lightbox
slug: lightbox
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Lightbox

Full-screen media viewer for images and 360° video. System-wide — not PDP-specific.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `media` | `ProductMedia[]` | required | Images and/or a 360° video |
| `initialIndex` | `number` | `0` | Which item to show first |
| `onClose` | `() => void` | required | Called when user closes |

## Usage

```tsx
const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

<button onClick={() => setLightboxIndex(0)}>Open</button>

{lightboxIndex !== null && (
  <Lightbox
    media={media}
    initialIndex={lightboxIndex}
    onClose={() => setLightboxIndex(null)}
  />
)}
```

## Keyboard navigation

- `Escape` — close
- `ArrowLeft` / `ArrowRight` — previous / next

## 360° video

When a `video360` item is active, a scrub bar is always visible. Drag the thumb to rotate.

## Quality checklist

- [x] `role="dialog"` + `aria-modal="true"`
- [x] Keyboard: Escape closes, arrows navigate
- [x] Close + nav buttons have `aria-label`
- [x] Tokens only — no hardcoded colours
- [x] Scrub bar always visible for 360° (no hover dependency)
```

- [ ] **Step 2.6: Commit**

```bash
git add packages/components/src/components/molecules/lightbox/
git commit -m "feat(lightbox): add system-wide Lightbox with 360° video scrub"
```

---

## Task 3: PdpLayout

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-layout.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-layout.stories.tsx`

- [ ] **Step 3.1: Write the story**

```tsx
// packages/components/src/components/templates/pdp/pdp-layout.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpLayout } from "./pdp-layout";

const MediaSlot = () => (
  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
    Media slot (sticky)
  </div>
);
const BodySlot = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 rounded bg-muted" />
    ))}
  </div>
);
const BelowFold = () => (
  <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
    Below-fold (full width)
  </div>
);

const meta: Meta<typeof PdpLayout> = {
  title: "Templates/PDP/Layout",
  component: PdpLayout,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpLayout>;

export const Default: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />}><BelowFold /></PdpLayout>,
};
export const NoChildren: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />} />,
};
export const WithStickyTop: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />} stickyTop="64px"><BelowFold /></PdpLayout>,
};
```

- [ ] **Step 3.2: Verify story fails** — navigate to Templates/PDP/Layout in Storybook; expect import error.

- [ ] **Step 3.3: Implement PdpLayout**

```tsx
// packages/components/src/components/templates/pdp/pdp-layout.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PdpLayoutProps } from "./pdp-types";

/**
 * PDP two-column layout shell. Dumb CSS — no logic, no state.
 * Left column (`media`) is sticky; right column (`body`) scrolls.
 * `children` renders below both columns at full width, consumer-ordered.
 */
export function PdpLayout({ media, body, children, stickyTop = "0px", className }: PdpLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)} data-slot="pdp-layout">
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start md:gap-12">
        <div className="md:sticky" style={{ top: stickyTop }} data-slot="pdp-layout-media">
          {media}
        </div>
        <div data-slot="pdp-layout-body">{body}</div>
      </div>
      {children && <div data-slot="pdp-layout-below">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 3.4: Verify stories render** — two-column on desktop, single column on mobile (resize window to check); inspect element to confirm `top: 64px` in WithStickyTop.

- [ ] **Step 3.5: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-layout.tsx \
        packages/components/src/components/templates/pdp/pdp-layout.stories.tsx
git commit -m "feat(pdp): add PdpLayout — two-column sticky-media shell"
```

---

## Task 4: PdpHeading

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-heading.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-heading.stories.tsx`

- [ ] **Step 4.1: Write the story**

```tsx
// packages/components/src/components/templates/pdp/pdp-heading.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpHeading } from "./pdp-heading";

const meta: Meta<typeof PdpHeading> = {
  title: "Templates/PDP/Heading",
  component: PdpHeading,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpHeading>;

export const WithSku: Story = {
  args: { name: "4-Prong 14K White Gold 5ct Lab Grown", sku: "NTB-C4P-WG14-5CT-7IN-LG" },
};
export const NoSku: Story = {
  args: { name: "Blue Sapphire Emerald Cut" },
};
export const LongName: Story = {
  args: {
    name: "Cushion Cut Natural Blue Sapphire 3.42ct Madagascar No Heat GIA Certified",
    sku: "SAP-CSH-BL-342-MAD-NH-GIA",
  },
};
```

- [ ] **Step 4.2: Verify story fails** — navigate to Templates/PDP/Heading; expect import error.

- [ ] **Step 4.3: Implement PdpHeading**

```tsx
// packages/components/src/components/templates/pdp/pdp-heading.tsx
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpHeadingProps } from "./pdp-types";

/** Product name as H1, optional SKU as a muted caption below. */
export function PdpHeading({ name, sku, className }: PdpHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} data-slot="pdp-heading">
      <Typography as="h1" variant="h3">{name}</Typography>
      {sku && (
        <Typography variant="caption" className="text-muted-foreground">{sku}</Typography>
      )}
    </div>
  );
}
```

- [ ] **Step 4.4: Verify stories render** — name is a large heading, SKU is small and muted, NoSku shows no second line.

- [ ] **Step 4.5: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-heading.tsx \
        packages/components/src/components/templates/pdp/pdp-heading.stories.tsx
git commit -m "feat(pdp): add PdpHeading — product name H1 + SKU caption"
```

---

## Task 5: PdpVariantSelector and PdpPrimaryAction

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-variant-selector.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-variant-selector.stories.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-primary-action.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-primary-action.stories.tsx`

- [ ] **Step 5.1: Write stories**

```tsx
// packages/components/src/components/templates/pdp/pdp-variant-selector.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { PdpVariantSelector } from "./pdp-variant-selector";

const meta: Meta<typeof PdpVariantSelector> = {
  title: "Templates/PDP/VariantSelector",
  component: PdpVariantSelector,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpVariantSelector>;

export const SizeSelector: Story = {
  render: () => {
    function S() {
      const [v, setV] = useState('7"');
      return (
        <PdpVariantSelector label="Size">
          <ToggleGroup type="single" value={v} onValueChange={(val) => val && setV(val)}>
            {['6"', '6.5"', '7"', '7.5"', '8"'].map((s) => (
              <ToggleGroupItem key={s} value={s} disabled={s === '8"'}>{s}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PdpVariantSelector>
      );
    }
    return <S />;
  },
};
```

```tsx
// packages/components/src/components/templates/pdp/pdp-primary-action.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { IconHeart, IconShare, IconShoppingCart } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { PdpPrimaryAction } from "./pdp-primary-action";

const onAddToCart = fn();

const meta: Meta<typeof PdpPrimaryAction> = {
  title: "Templates/PDP/PrimaryAction",
  component: PdpPrimaryAction,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpPrimaryAction>;

export const Default: Story = {
  render: () => (
    <PdpPrimaryAction>
      <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
    </PdpPrimaryAction>
  ),
};
export const WithSecondaryActions: Story = {
  render: () => (
    <PdpPrimaryAction
      secondaryActions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Add to shortlist"><IconHeart size={16} /></Button>
          <Button variant="outline" size="icon" aria-label="Share"><IconShare size={16} /></Button>
        </div>
      }
    >
      <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
    </PdpPrimaryAction>
  ),
};
```

- [ ] **Step 5.2: Verify stories fail** — expect import errors for both.

- [ ] **Step 5.3: Implement PdpVariantSelector**

```tsx
// packages/components/src/components/templates/pdp/pdp-variant-selector.tsx
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpVariantSelectorProps } from "./pdp-types";

/**
 * Label + fieldset shell for variant controls. Consumer provides the
 * controls (ToggleGroup, RadioGroup, etc.). Disabled/OOS states are the
 * consumer's responsibility. Categories without variants omit this entirely.
 */
export function PdpVariantSelector({ label, children, className }: PdpVariantSelectorProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2 border-none p-0 m-0", className)} data-slot="pdp-variant-selector">
      <legend>
        <Typography variant="subtitle-2">{label}</Typography>
      </legend>
      {children}
    </fieldset>
  );
}
```

- [ ] **Step 5.4: Implement PdpPrimaryAction**

```tsx
// packages/components/src/components/templates/pdp/pdp-primary-action.tsx
import { cn } from "@/lib/utils";
import type { PdpPrimaryActionProps } from "./pdp-types";

/**
 * Full-width CTA area with an optional secondary actions zone.
 * Consumer provides the Button — this shell enforces width and spacing only.
 */
export function PdpPrimaryAction({ children, secondaryActions, className }: PdpPrimaryActionProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} data-slot="pdp-primary-action">
      <div className="w-full">{children}</div>
      {secondaryActions && (
        <div className="flex items-center gap-2" data-slot="pdp-primary-action-secondary">
          {secondaryActions}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5.5: Verify stories render** — SizeSelector shows "Size" label above toggle buttons, 8" disabled; WithSecondaryActions shows full-width button + icon buttons below.

- [ ] **Step 5.6: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-variant-selector.tsx \
        packages/components/src/components/templates/pdp/pdp-variant-selector.stories.tsx \
        packages/components/src/components/templates/pdp/pdp-primary-action.tsx \
        packages/components/src/components/templates/pdp/pdp-primary-action.stories.tsx
git commit -m "feat(pdp): add PdpVariantSelector and PdpPrimaryAction shells"
```

---

## Task 6: PdpDelivery and PdpReturns

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-delivery.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-delivery.stories.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-returns.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-returns.stories.tsx`

- [ ] **Step 6.1: Write stories**

```tsx
// packages/components/src/components/templates/pdp/pdp-delivery.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpDelivery } from "./pdp-delivery";

const meta: Meta<typeof PdpDelivery> = {
  title: "Templates/PDP/Delivery",
  component: PdpDelivery,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpDelivery>;

export const Regular: Story = { args: { variant: "regular", date: "15 business days" } };
export const Express: Story = { args: { variant: "express", date: "Nov 18–23" } };
export const RegularWithShipsFrom: Story = { args: { variant: "regular", date: "15 business days", shipsFrom: "Botswana" } };
export const ExpressWithShipsFrom: Story = { args: { variant: "express", date: "Nov 18–23", shipsFrom: "United States" } };
```

```tsx
// packages/components/src/components/templates/pdp/pdp-returns.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpReturns } from "./pdp-returns";

const meta: Meta<typeof PdpReturns> = {
  title: "Templates/PDP/Returns",
  component: PdpReturns,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpReturns>;

export const Returnable: Story = { args: { variant: "returnable", returnsWindow: "14 days" } };
export const ReturnableWithPolicyLink: Story = {
  render: () => <PdpReturns variant="returnable" returnsWindow="14 days" policyLink={<a href="#">Returns Policy</a>} />,
};
export const NonReturnable: Story = { args: { variant: "non-returnable" } };
```

- [ ] **Step 6.2: Verify stories fail** — import errors expected.

- [ ] **Step 6.3: Implement PdpDelivery**

```tsx
// packages/components/src/components/templates/pdp/pdp-delivery.tsx
import { IconMapPin, IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { BrandExpress } from "../../atoms/brand-express/brand-express";
import { Typography } from "../../atoms/typography/typography";
import type { PdpDeliveryProps } from "./pdp-types";

/** Delivery timeline for PDP. Same variant axis as PlpGridItemDelivery, PDP density. */
export function PdpDelivery({ variant, date, shipsFrom, className }: PdpDeliveryProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)} data-slot="pdp-delivery">
      <div className="flex items-center gap-2">
        {variant === "express"
          ? <BrandExpress className="shrink-0" />
          : <IconTruckDelivery size={16} className="shrink-0 text-muted-foreground" />}
        <Typography variant="body-2">
          {variant === "express"
            ? <span className="text-express">Get it {date}</span>
            : <>Estimated delivery in <strong>{date}</strong></>}
        </Typography>
      </div>
      {shipsFrom && (
        <div className="flex items-center gap-2 pl-6">
          <IconMapPin size={12} className="shrink-0 text-muted-foreground" />
          <Typography variant="caption" className="text-muted-foreground">Ships from {shipsFrom}</Typography>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.4: Implement PdpReturns**

```tsx
// packages/components/src/components/templates/pdp/pdp-returns.tsx
import { IconArrowBackUp, IconBan } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpReturnsProps } from "./pdp-types";

/** Returns policy for PDP. Same variant axis as PlpGridItemReturnable, with window and policy link. */
export function PdpReturns({ variant, returnsWindow, policyLink, className }: PdpReturnsProps) {
  const returnable = variant === "returnable";
  return (
    <div className={cn("flex items-center gap-2", className)} data-slot="pdp-returns">
      {returnable
        ? <IconArrowBackUp size={16} className="shrink-0 text-success" />
        : <IconBan size={16} className="shrink-0 text-muted-foreground" />}
      <Typography variant="body-2">
        {returnable ? (
          <>
            <span className="font-medium text-success">{returnsWindow ? `${returnsWindow} returns` : "Returnable"}</span>
            {policyLink && <span className="text-muted-foreground"> · {policyLink}</span>}
          </>
        ) : (
          <span className="text-muted-foreground">Non-returnable</span>
        )}
      </Typography>
    </div>
  );
}
```

- [ ] **Step 6.5: Verify stories render** — Express: coloured express badge. Regular: truck icon + bold date. Returnable: green icon + "14 days returns" + policy link. NonReturnable: muted ban icon.

- [ ] **Step 6.6: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-delivery.tsx \
        packages/components/src/components/templates/pdp/pdp-delivery.stories.tsx \
        packages/components/src/components/templates/pdp/pdp-returns.tsx \
        packages/components/src/components/templates/pdp/pdp-returns.stories.tsx
git commit -m "feat(pdp): add PdpDelivery and PdpReturns primitives"
```

---

## Task 7: PdpSpecifications and PdpDescription

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-specifications.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-specifications.stories.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-description.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-description.stories.tsx`

- [ ] **Step 7.1: Write stories**

```tsx
// packages/components/src/components/templates/pdp/pdp-specifications.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/badge/badge";
import { PdpSpecifications } from "./pdp-specifications";

const meta: Meta<typeof PdpSpecifications> = {
  title: "Templates/PDP/Specifications",
  component: PdpSpecifications,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpSpecifications>;

export const TennisBracelet: Story = {
  args: {
    rows: [
      { label: "Style", value: "Classic 4 prong" },
      { label: "Metal", value: "14k White Gold" },
      { label: "Metal weight", value: "9.01g" },
      { label: "Diamond type", value: "Lab-grown" },
      { label: "Total carat weight", value: "5ct" },
      { label: "Stone count", value: "55" },
      { label: "Stone quality", value: "F–G, VS, Very Good" },
    ],
  },
};
export const WithReactNodeValues: Story = {
  render: () => (
    <PdpSpecifications rows={[
      { label: "Diamond type", value: <Badge variant="outline">Lab-grown</Badge> },
      { label: "Certification", value: <Badge variant="info">GIA</Badge> },
      { label: "Origin", value: "Botswana" },
    ]} />
  ),
};
export const CustomHeading: Story = {
  args: {
    heading: "Stone details",
    rows: [{ label: "Shape", value: "Emerald" }, { label: "Carat", value: "3.42ct" }],
  },
};
```

```tsx
// packages/components/src/components/templates/pdp/pdp-description.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpDescription } from "./pdp-description";

const meta: Meta<typeof PdpDescription> = {
  title: "Templates/PDP/Description",
  component: PdpDescription,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpDescription>;

export const PlainText: Story = {
  args: { children: "This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in finely crafted four prong baskets." },
};
export const RichContent: Story = {
  render: () => (
    <PdpDescription>
      <p>This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in finely crafted four prong baskets.</p>
      <p>The 14k white gold setting provides a bright, cool-toned backdrop that enhances the brilliance of each stone.</p>
    </PdpDescription>
  ),
};
```

- [ ] **Step 7.2: Verify stories fail** — import errors expected.

- [ ] **Step 7.3: Implement PdpSpecifications**

```tsx
// packages/components/src/components/templates/pdp/pdp-specifications.tsx
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpSpecificationsProps } from "./pdp-types";

/**
 * Two-column key-value spec table. Consumer provides all rows; values are
 * ReactNode so badges, links, and formatted strings all work.
 */
export function PdpSpecifications({ rows, heading = "Specifications", className }: PdpSpecificationsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="pdp-specifications">
      <Typography as="h2" variant="h4">{heading}</Typography>
      <dl className="grid grid-cols-1 sm:grid-cols-[1fr_1fr]">
        {rows.map(({ label, value }) => (
          <div key={label} className="col-span-full grid grid-cols-subgrid border-b border-border py-3 last:border-0">
            <dt>
              <Typography variant="body-2" className="text-muted-foreground">{label}</Typography>
            </dt>
            <dd className="sm:text-right">
              <Typography variant="body-2" className="font-medium">{value}</Typography>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

- [ ] **Step 7.4: Implement PdpDescription**

```tsx
// packages/components/src/components/templates/pdp/pdp-description.tsx
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpDescriptionProps } from "./pdp-types";

/** Typography wrapper for freeform product description. No opinion on content format. */
export function PdpDescription({ children, className }: PdpDescriptionProps) {
  return (
    <div className={cn("prose prose-sm max-w-none text-muted-foreground", className)} data-slot="pdp-description">
      {typeof children === "string"
        ? <Typography variant="body-2">{children}</Typography>
        : children}
    </div>
  );
}
```

- [ ] **Step 7.5: Verify stories render** — TennisBracelet: two-column label/value rows with bottom borders. WithReactNodeValues: badges render inside value cells. RichContent: two paragraphs with spacing.

- [ ] **Step 7.6: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-specifications.tsx \
        packages/components/src/components/templates/pdp/pdp-specifications.stories.tsx \
        packages/components/src/components/templates/pdp/pdp-description.tsx \
        packages/components/src/components/templates/pdp/pdp-description.stories.tsx
git commit -m "feat(pdp): add PdpSpecifications and PdpDescription primitives"
```

---

## Task 8: PdpMediaGallery

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-media-gallery.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-media-gallery.stories.tsx`

- [ ] **Step 8.1: Write the story**

```tsx
// packages/components/src/components/templates/pdp/pdp-media-gallery.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Lightbox } from "../../molecules/lightbox/lightbox";
import { PdpMediaGallery } from "./pdp-media-gallery";
import type { ProductMedia } from "./pdp-types";

const IMAGES: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "Tennis bracelet front", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Tennis bracelet side", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=800", alt: "Tennis bracelet clasp", thumbnailSrc: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=120" },
];
const WITH_VIDEO: ProductMedia[] = [
  ...IMAGES,
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
];

function GalleryWithLightbox({ media }: { media: ProductMedia[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  return (
    <>
      <PdpMediaGallery media={media} onMediaClick={setIdx} />
      {idx !== null && <Lightbox media={media} initialIndex={idx} onClose={() => setIdx(null)} />}
    </>
  );
}

const meta: Meta<typeof PdpMediaGallery> = {
  title: "Templates/PDP/MediaGallery",
  component: PdpMediaGallery,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PdpMediaGallery>;

export const StaticImages: Story = { render: () => <GalleryWithLightbox media={IMAGES} /> };
export const SingleImage: Story = { render: () => <GalleryWithLightbox media={[IMAGES[0]]} /> };
export const WithVideo360: Story = { render: () => <GalleryWithLightbox media={WITH_VIDEO} /> };
```

- [ ] **Step 8.2: Verify story fails** — import error expected.

- [ ] **Step 8.3: Implement PdpMediaGallery**

```tsx
// packages/components/src/components/templates/pdp/pdp-media-gallery.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useHasHover } from "../../../../hooks/use-has-hover";
import type { PdpMediaGalleryProps, ProductMedia } from "./pdp-types";

function Thumbnail({ item, selected, onClick }: { item: ProductMedia; selected: boolean; onClick: () => void }) {
  const src = item.type === "image" ? (item.thumbnailSrc ?? item.src) : (item.poster ?? "");
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition-colors",
        selected ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
      )}
      aria-pressed={selected}
    >
      {src && <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />}
      {item.type === "video360" && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">360°</span>
      )}
    </button>
  );
}

function ScrubBar({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [position, setPosition] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPosition(ratio);
    video.currentTime = ratio * video.duration;
  }, [videoRef]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) seekTo(e.clientX); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [seekTo]);

  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 pb-3 pt-2">
      <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/60">Rotate</p>
      <div ref={barRef} className="relative h-1 cursor-ew-resize rounded-full bg-white/30" onMouseDown={(e) => { dragging.current = true; seekTo(e.clientX); }}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/80" style={{ width: `${position * 100}%` }} />
        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${position * 100}%` }} />
      </div>
    </div>
  );
}

function MainView({ item, onClick }: { item: ProductMedia; onClick: () => void }) {
  const hasHover = useHasHover();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrubVisible, setScrubVisible] = useState(false);

  if (item.type === "video360") {
    return (
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-black"
        onMouseEnter={() => hasHover && setScrubVisible(true)}
        onMouseLeave={() => setScrubVisible(false)}
        onClick={onClick}
        data-slot="pdp-media-gallery-main-360"
      >
        <video ref={videoRef} src={item.src} poster={item.poster} className="h-full w-full object-contain" playsInline muted preload="auto" />
        {/* Desktop: scrub bar on hover. Mobile (no hover): scrub bar always visible. */}
        {(scrubVisible || !hasHover) && <ScrubBar videoRef={videoRef} />}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted"
      onClick={onClick}
      aria-label="View full screen"
      data-slot="pdp-media-gallery-main-image"
    >
      <img src={item.src} alt={item.alt} className="h-full w-full object-cover" draggable={false} />
    </button>
  );
}

/**
 * Vertical thumbnail strip + main view. Manages selected thumbnail state.
 * Fires `onMediaClick(index)` on click — consumer opens Lightbox.
 *
 * Desktop 360°: scrub bar appears on hover; clicking fires `onMediaClick`.
 * Mobile 360°: no scrub bar in gallery — tap fires `onMediaClick` to open Lightbox.
 */
export function PdpMediaGallery({ media, onMediaClick, className }: PdpMediaGalleryProps) {
  const [selected, setSelected] = useState(0);
  return (
    <div className={cn("flex gap-3", className)} data-slot="pdp-media-gallery">
      <div className="flex flex-col gap-2" data-slot="pdp-media-gallery-strip">
        {media.map((item, i) => (
          <Thumbnail key={i} item={item} selected={i === selected} onClick={() => setSelected(i)} />
        ))}
      </div>
      <div className="flex-1">
        <MainView item={media[selected]} onClick={() => onMediaClick?.(selected)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 8.4: Verify stories render**

Open Storybook → Templates/PDP/MediaGallery. Verify:
- StaticImages: vertical strip on left, large image swaps on thumb click, clicking image opens Lightbox
- WithVideo360: 360° thumb appears last, selecting it shows video, hovering shows scrub bar, clicking video opens Lightbox at that index (video plays with scrub in Lightbox)

- [ ] **Step 8.5: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-media-gallery.tsx \
        packages/components/src/components/templates/pdp/pdp-media-gallery.stories.tsx
git commit -m "feat(pdp): add PdpMediaGallery with 360° scrub bar and Lightbox trigger"
```

---

## Task 9: PdpPrice

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp-price.tsx`
- Create: `packages/components/src/components/templates/pdp/pdp-price.stories.tsx`

- [ ] **Step 9.1: Write the story**

```tsx
// packages/components/src/components/templates/pdp/pdp-price.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PdpPrice } from "./pdp-price";

const ALT = { amount: 1082, currency: "EUR" };

const meta: Meta<typeof PdpPrice> = {
  title: "Templates/PDP/Price",
  component: PdpPrice,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PdpPrice>;

export const Simple: Story = {
  args: { amount: 1174, currency: "USD", label: "Final delivered price", alternateCurrency: ALT },
};
export const SimpleNoAltCurrency: Story = {
  args: { amount: 1174, currency: "USD", label: "Final delivered price", alternateCurrency: ALT, showAlternateCurrency: false },
};
export const PerCarat: Story = {
  args: { amount: 4250, currency: "USD", perCarat: { amount: 850, currency: "USD" }, alternateCurrency: ALT },
};
export const WithDiscount: Story = {
  args: { amount: 4250, currency: "USD", discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};
export const DiscountAndPerCarat: Story = {
  args: { amount: 4250, currency: "USD", perCarat: { amount: 850, currency: "USD" }, discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};
export const InclTariffs: Story = {
  args: { amount: 4250, currency: "USD", includeTariffs: true, alternateCurrency: ALT },
};
export const TariffsAndDiscount: Story = {
  args: { amount: 4250, currency: "USD", includeTariffs: true, discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};
export const Legacy: Story = {
  args: { amount: 3800, currency: "USD", legacy: { deliveredAmount: 4250, deliveredCurrency: "USD" }, alternateCurrency: ALT },
};
```

- [ ] **Step 9.2: Verify story fails** — import error expected.

- [ ] **Step 9.3: Implement PdpPrice**

```tsx
// packages/components/src/components/templates/pdp/pdp-price.tsx
import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../atoms/hover-card/hover-card";
import { Typography } from "../../atoms/typography/typography";
import type { PdpPriceProps } from "./pdp-types";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

/**
 * Full pricing matrix for the PDP body. Supports all pricing scenarios:
 * simple, per-carat, discount, tariffs-included, legacy (item + delivered),
 * and alternate currency.
 *
 * `legacy` and `discount` are mutually exclusive.
 * `showAlternateCurrency: false` hides the alt currency line even when data is present.
 */
export function PdpPrice({
  amount, currency, label,
  perCarat, discount, includeTariffs,
  legacy, alternateCurrency, showAlternateCurrency = true,
  className,
}: PdpPriceProps) {
  const showAlt = showAlternateCurrency && !!alternateCurrency;

  return (
    <div className={cn("flex flex-col gap-1", className)} data-slot="pdp-price">
      {/* Tariffs note */}
      {includeTariffs && (
        <div className="flex items-center gap-1">
          <Typography variant="caption" className="text-muted-foreground">
            🇺🇸 Stone price incl. tariffs
          </Typography>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" aria-label="About US tariffs">
                <IconInfoCircle size={14} className="text-muted-foreground" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="max-w-64 text-sm">
              This price already includes US import tariffs. No additional charges at checkout.
            </HoverCardContent>
          </HoverCard>
        </div>
      )}

      {/* Label (e.g. "Final delivered price") — omitted in legacy mode */}
      {label && !legacy && (
        <Typography variant="caption" className="text-muted-foreground">{label}</Typography>
      )}

      {/* Discount row */}
      {discount && (
        <div className="flex items-center gap-2">
          <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">
            -{discount.percentage}%
          </span>
          <Typography variant="body-2" className="text-muted-foreground line-through">
            {fmt(discount.originalAmount, currency)}
          </Typography>
        </div>
      )}

      {/* Main amount */}
      <Typography as="p" variant="h3" className="font-bold">{fmt(amount, currency)}</Typography>

      {/* Per-carat */}
      {perCarat && (
        <Typography variant="caption" className="text-muted-foreground">
          {fmt(perCarat.amount, perCarat.currency)} / ct
        </Typography>
      )}

      {/* Legacy delivered price */}
      {legacy && (
        <Typography variant="caption" className="text-muted-foreground">
          Delivered: {fmt(legacy.deliveredAmount, legacy.deliveredCurrency)}
        </Typography>
      )}

      {/* Alternate currency */}
      {showAlt && (
        <Typography variant="caption" className="text-muted-foreground">
          ≈ {fmt(alternateCurrency!.amount, alternateCurrency!.currency)}
        </Typography>
      )}
    </div>
  );
}
```

- [ ] **Step 9.4: Verify all scenarios**

Open Storybook → Templates/PDP/Price. For each story verify:
- Simple: label caption → large price → "≈ €1,082.00"
- SimpleNoAltCurrency: label → price only (no euro line)
- PerCarat: price → "850.00 / ct" → alt currency
- WithDiscount: red "-12%" badge + struck-through original → price → alt currency
- InclTariffs: flag note + hover card icon → price → alt currency
- Legacy: large item price → "Delivered: $4,250.00" caption → alt currency

- [ ] **Step 9.5: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp-price.tsx \
        packages/components/src/components/templates/pdp/pdp-price.stories.tsx
git commit -m "feat(pdp): add PdpPrice — full pricing matrix with all variant scenarios"
```

---

## Task 10: Assembly meta-story

**Files:**
- Create: `packages/components/src/components/templates/pdp/pdp.stories.tsx`

- [ ] **Step 10.1: Write the meta-story**

```tsx
// packages/components/src/components/templates/pdp/pdp.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { IconHeart, IconShare, IconShoppingCart } from "@tabler/icons-react";
import { AppShell, AppShellHeader, AppShellMain } from "../../organisms/app-shell/app-shell";
import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { Lightbox } from "../../molecules/lightbox/lightbox";
import { PdpDelivery } from "./pdp-delivery";
import { PdpDescription } from "./pdp-description";
import { PdpHeading } from "./pdp-heading";
import { PdpLayout } from "./pdp-layout";
import { PdpMediaGallery } from "./pdp-media-gallery";
import { PdpPrice } from "./pdp-price";
import { PdpPrimaryAction } from "./pdp-primary-action";
import { PdpReturns } from "./pdp-returns";
import { PdpSpecifications } from "./pdp-specifications";
import { PdpVariantSelector } from "./pdp-variant-selector";
import type { ProductMedia } from "./pdp-types";

const onAddToCart = fn();
const onShortlist = fn();

const MEDIA: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "4-Prong 14K White Gold Tennis Bracelet", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Tennis bracelet side view", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=120" },
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
];

const SPEC_ROWS = [
  { label: "Style", value: "Classic 4 prong" },
  { label: "Metal", value: "14k White Gold" },
  { label: "Metal weight", value: "9.01g" },
  { label: "Diamond type", value: <Badge variant="outline">Lab-grown</Badge> },
  { label: "Total carat weight", value: "5ct" },
  { label: "Stone count", value: "55" },
  { label: "Stone quality", value: "F–G, VS, Very Good" },
];

const SIZES = ['6"', '6.5"', '7"', '7.5"', '8"'];

/**
 * Canonical assembly reference for a tennis bracelet PDP.
 *
 * NOT a template component — an example of how a consumer composes the
 * PDP primitives into a category-specific PDP. Copy this pattern, adapt
 * the data, and add category-specific logic.
 */
function TennisBraceletPDP() {
  const [size, setSize] = useState('7"');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <PdpLayout
        stickyTop="64px"
        media={<PdpMediaGallery media={MEDIA} onMediaClick={setLightboxIndex} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name="4-Prong 14K White Gold 5ct Lab Grown" sku="NTB-C4P-WG14-5CT-7IN-LG" />
            <PdpPrice
              amount={1174}
              currency="USD"
              label="Final delivered price"
              alternateCurrency={{ amount: 1082, currency: "EUR" }}
            />
            <PdpVariantSelector label="Size">
              <ToggleGroup type="single" value={size} onValueChange={(v) => v && setSize(v)}>
                {SIZES.map((s) => (
                  <ToggleGroupItem key={s} value={s} disabled={s === '8"'}>{s}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </PdpVariantSelector>
            <PdpPrimaryAction
              secondaryActions={
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={onShortlist} aria-label="Add to shortlist"><IconHeart size={16} /></Button>
                  <Button variant="outline" size="icon" aria-label="Share"><IconShare size={16} /></Button>
                </div>
              }
            >
              <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
            </PdpPrimaryAction>
            <div className="flex flex-col gap-2">
              <PdpReturns variant="returnable" returnsWindow="14 days" policyLink={<a href="#">Returns Policy applies</a>} />
              <PdpDelivery variant="regular" date="15 business days" />
            </div>
          </div>
        }
      >
        <PdpSpecifications rows={SPEC_ROWS} />
        <PdpDescription>
          This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in finely crafted four prong baskets.
        </PdpDescription>
      </PdpLayout>

      {lightboxIndex !== null && (
        <Lightbox media={MEDIA} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

const meta: Meta = {
  title: "Templates/PDP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppShell>
        <AppShellHeader onSearch={() => {}} />
        <AppShellMain>
          <div className="mx-auto max-w-5xl px-4 py-8">
            <Story />
          </div>
        </AppShellMain>
      </AppShell>
    ),
  ],
};
export default meta;

export const TennisBracelet: StoryObj = {
  render: () => <TennisBraceletPDP />,
};
```

- [ ] **Step 10.2: Verify meta-story renders**

Open Storybook → Templates/PDP. Verify complete assembly: sticky gallery left, info panel right, specs + description below. Test:
- Click image → Lightbox opens at correct index
- Click 360° thumbnail in gallery → video shows with scrub bar; click it → Lightbox opens at video
- Escape key closes Lightbox
- Size selector: selecting a size updates the toggle; 8" is disabled

- [ ] **Step 10.3: Commit**

```bash
git add packages/components/src/components/templates/pdp/pdp.stories.tsx
git commit -m "feat(pdp): add canonical TennisBracelet assembly meta-story"
```

---

## Task 11: COMPONENT.md files

**Files:**
- Create: `packages/components/src/components/templates/pdp/COMPONENT.md`

- [ ] **Step 11.1: Write COMPONENT.md**

```markdown
---
name: PDP (Product Detail Page)
slug: pdp
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# PDP (Product Detail Page)

A composition kit for building category-specific Product Detail Pages. Like the PLP kit, no single `<PDP>` component is exported — consumers assemble category PDPs from these primitives and reference the assembly in their own code.

## Kit pieces

| Component | Role |
|---|---|
| [`PdpLayout`](./pdp-layout.tsx) | Two-column shell — media sticky left, body scrolling right, full-width below |
| [`PdpMediaGallery`](./pdp-media-gallery.tsx) | Thumbnail strip + main image + 360° scrub bar + Lightbox trigger |
| [`PdpHeading`](./pdp-heading.tsx) | Product name (H1) + SKU caption |
| [`PdpPrice`](./pdp-price.tsx) | Full pricing matrix — simple, per-carat, discount, tariffs, legacy, alt currency |
| [`PdpVariantSelector`](./pdp-variant-selector.tsx) | Label + fieldset shell for variant controls |
| [`PdpPrimaryAction`](./pdp-primary-action.tsx) | Full-width CTA area + secondary actions zone |
| [`PdpDelivery`](./pdp-delivery.tsx) | Express / regular delivery timeline |
| [`PdpReturns`](./pdp-returns.tsx) | Returnable / non-returnable with window and policy link |
| [`PdpSpecifications`](./pdp-specifications.tsx) | Key-value spec table — consumer provides all rows |
| [`PdpDescription`](./pdp-description.tsx) | Typography wrapper for freeform product description |

**System-wide (not PDP-specific):** [`Lightbox`](../../molecules/lightbox/lightbox.tsx)

## Assembly reference

The canonical assembly pattern is in [`pdp.stories.tsx`](./pdp.stories.tsx) — a complete `TennisBraceletPDP` showing how all primitives compose. Copy this pattern and adapt it for your category.

Consumers own: data fetching, routing, cart handlers, variant selection state, Lightbox open/close state.

## Usage guidelines

**When to use:** Any product detail page. Use what applies to your category — omit what doesn't (e.g. `PdpVariantSelector` for products without variants).

**When NOT to use:** Do not wrap these primitives in a monolithic component that hides them. The composability is the point.

## Quality checklist

- [x] Accessible: H1 for product name, semantic fieldset/legend for variant selector, aria-modal on Lightbox
- [x] Responsive: single-column mobile, two-column desktop; spec table collapses to stacked
- [x] Tokens only — no hardcoded visual values
- [x] 360° scrub bar: desktop hover in gallery, always visible in Lightbox, mobile taps to Lightbox
```

- [ ] **Step 11.2: Commit**

```bash
git add packages/components/src/components/templates/pdp/COMPONENT.md
git commit -m "docs(pdp): add COMPONENT.md for PDP template kit"
```

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| Primitive inventory — 10 primitives + Lightbox | Tasks 2–9 |
| `PdpLayout` — `body` slot, sticky, `stickyTop` prop | Task 3 |
| `PdpMediaGallery` — thumbs, swap, 360 scrub bar on hover only | Task 8 |
| `PdpMediaGallery` mobile — no scrub, tap to Lightbox | Task 8 (`useHasHover`) |
| Lightbox — images + 360 video + scrub bar always visible | Task 2 |
| `PdpHeading` — name H1, SKU caption | Task 4 |
| `PdpPrice` — all 6 scenarios, `legacy`/`discount` mutually exclusive, `showAlternateCurrency` | Task 9 |
| `PdpVariantSelector` — fieldset/legend shell, consumer provides controls | Task 5 |
| `PdpPrimaryAction` — full-width CTA + secondary zone | Task 5 |
| `PdpDelivery` — express/regular, `shipsFrom` | Task 6 |
| `PdpReturns` — returnable/non-returnable, `returnsWindow`, `policyLink` | Task 6 |
| `PdpSpecifications` — ReactNode values, custom heading | Task 7 |
| `PdpDescription` — string or rich children | Task 7 |
| Mobile `PdpLayout` stacks | Task 3 (`md:` breakpoint) |
| Mobile `PdpSpecifications` collapses | Task 7 (`sm:` breakpoint) |
| Assembly meta-story | Task 10 |
| COMPONENT.md | Task 11 |
