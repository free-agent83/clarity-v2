# PLP Template Phase 3b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 360 rotatable media on hover to the PLP grid item. Static thumbnail crossfades into a rotating video when the user hovers on pointer devices; horizontal cursor position scrubs the video. Videos are lazy-loaded via intersection observer and never mounted on touch devices.

**Architecture:** One new optional `media360` field on `GridItemData`. The thumbnail block is extracted from `plp-grid-item.tsx` into a new `plp-grid-thumbnail.tsx` sub-component that owns the static image, optional 360 video, intersection observer, mousemove scrubbing, and the hover action toolbar. A new `useHasHover` hook gates the entire 360 code path — on touch devices no video element ever mounts.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, existing Clarity V2 primitives (`Button`, `Badge`, `Tooltip`, Tabler icons), browser-native `<video>` + `IntersectionObserver`, Storybook 8.6 (CSF3).

**Design spec:** `docs/plans/specs/2026-04-16-plp-template-phase3b-design.md`
**Parent architectural spec:** `docs/plans/specs/2026-04-16-plp-template-component-spec.md`

---

## File map

All paths under `packages/components/src/components/templates/plp/` unless noted.

| File | Action | Responsibility |
|------|--------|---------------|
| `plp-types.ts` | Modify | Add optional `media360` field to `GridItemData` |
| `hooks/use-has-hover.ts` | Create | `matchMedia("(hover: hover)")` hook |
| `grid/plp-grid-thumbnail.tsx` | Create | Thumbnail sub-component — static image + optional 360 video + hover toolbar + selection checkbox |
| `grid/plp-grid-item.tsx` | Modify | Delegate thumbnail rendering to `PlpGridThumbnail`; remove inline thumbnail logic |
| `grid/plp-grid-item.stories.tsx` | Modify | Add `With360Media` story |
| `plp-template.stories.tsx` | Modify | Sprinkle `media360` onto ~1/3 of mock items |
| `COMPONENT.md` | Modify | Bump to 0.4.0, document `media360` field |
| `packages/components/CHANGELOG.md` | Modify | Add Phase 3b entry |

---

## Conventions reference

Read `packages/components/CONTRIBUTING.md` before writing code. Recap:

- **Imports:** `cn()` from `@/lib/utils`. Existing primitives via tier paths.
- **Props:** `interface` for props, JSDoc on every named export.
- **Exports:** Named only.
- **Comments:** JSDoc only on named exports.
- **Tokens:** Tailwind theme classes or `var(--token)` only.
- **Stories:** CSF3, `tags: ["autodocs"]`, compose from system components only.
- **Client components:** `"use client"` on any file using hooks/state/event handlers.

---

## Task 1: Add `media360` to GridItemData

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-types.ts`

- [ ] **Step 1: Append `media360` field to `GridItemData` interface**

Open `plp-types.ts` and locate the `GridItemData` interface. Append the following field at the end of the interface, before the closing `}`:

```ts
  /**
   * Optional 360 rotation video. When present and the viewport supports
   * hover (pointer devices), the grid item's thumbnail crossfades from
   * the static image into this video on hover, and horizontal cursor
   * movement scrubs the video's currentTime.
   *
   * Touch devices ignore this field entirely — no video element is mounted.
   * The Lightbox (separate spec) is the touch-side experience for 360 media.
   *
   * Encode the source video with dense keyframes (short GOP, e.g. every
   * 2–3 frames) so seek-based scrubbing is smooth. Sparse-keyframe videos
   * will stutter when the cursor moves across the thumbnail.
   */
  media360?: {
    /** URL to an MP4 or WebM containing the full rotation sequence. */
    videoUrl: string;
  };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-types.ts
git commit -m "feat(plp): add optional media360 field to GridItemData"
```

---

## Task 2: `useHasHover` hook

**Files:**
- Create: `packages/components/src/components/templates/plp/hooks/use-has-hover.ts`

Mirrors the existing `useIsTabletUp` pattern (`hooks/use-is-tablet-up.ts`).

- [ ] **Step 1: Create the hook**

```ts
// plp/hooks/use-has-hover.ts
import * as React from "react";

/**
 * Returns `true` when the viewport supports hover interaction (pointer
 * devices) via the `(hover: hover)` media query.
 *
 * Returns `false` during SSR and the first client render, then updates
 * to the actual value after the `matchMedia` listener attaches. This
 * means 360 video elements never render during SSR — they only appear
 * after a client-side effect confirms hover support.
 */
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia("(hover: hover)");
    const onChange = () => setHasHover(mql.matches);
    mql.addEventListener("change", onChange);
    setHasHover(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!hasHover;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/hooks/use-has-hover.ts
git commit -m "feat(plp): add useHasHover hook for pointer-device detection"
```

---

## Task 3: `PlpGridThumbnail` component

**Files:**
- Create: `packages/components/src/components/templates/plp/grid/plp-grid-thumbnail.tsx`

This component takes over the thumbnail block from `plp-grid-item.tsx`. It owns:
- Static image rendering with hover fade (when 360 available)
- Optional 360 video with intersection-observer-based lazy loading and mousemove scrubbing
- Hover-revealed action toolbar (platform actions + category actions)
- Selection checkbox (when `enableSelection` is true)

All of this logic currently lives inline in `plp-grid-item.tsx`. The `PlatformActions` helper currently in that file is moved here since it's only used by the thumbnail block.

- [ ] **Step 1: Create the thumbnail component**

```tsx
// plp/grid/plp-grid-thumbnail.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconHeart,
  IconPhoto,
  IconShare,
  IconSquare,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms/tooltip/tooltip";
import { useHasHover } from "../hooks/use-has-hover";
import type { GridItemData } from "../plp-types";

/**
 * Thumbnail for a PLP grid item.
 *
 * Renders a static image with a hover-revealed action toolbar (platform
 * actions: favorite, share, view media; plus any category-specific
 * actions) and an optional selection checkbox.
 *
 * When `data.media360` is present and the viewport supports hover
 * (pointer devices), a `<video>` element sits behind the static image
 * and the image crossfades away on hover. Horizontal cursor position
 * across the thumbnail maps to `video.currentTime`, producing a
 * rotate-by-hand feel. The video is lazy-loaded via an intersection
 * observer to avoid mass preloading on page render.
 *
 * Touch devices skip the 360 code path entirely — no video element is
 * mounted and no network requests for video are issued.
 */
export function PlpGridThumbnail({ data }: { data: GridItemData }) {
  const hasHover = useHasHover();
  const canRender360 = hasHover && !!data.media360;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInViewport, setVideoInViewport] = useState(false);

  // Intersection observer for lazy video load — only when 360 is active
  useEffect(() => {
    if (!canRender360) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoInViewport(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canRender360]);

  // Upgrade preload from "metadata" to "auto" when thumbnail is in viewport
  useEffect(() => {
    if (!videoInViewport) return;
    const video = videoRef.current;
    if (!video) return;
    video.preload = "auto";
    video.load();
  }, [videoInViewport]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!canRender360) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;
    if (!Number.isFinite(video.duration)) return;

    const rect = container.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  }

  function handleMouseLeave() {
    if (!canRender360) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
      onMouseMove={canRender360 ? handleMouseMove : undefined}
      onMouseLeave={canRender360 ? handleMouseLeave : undefined}
    >
      {/* 360 video (rendered only on pointer devices with data) */}
      {canRender360 && data.media360 && (
        <video
          ref={videoRef}
          src={data.media360.videoUrl}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {/* Static image — fades out on hover only when a 360 video is available */}
      <img
        src={data.thumbnailSrc}
        alt={data.thumbnailAlt}
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ease-out",
          canRender360 && "group-hover:opacity-0"
        )}
      />

      {/* Hover action toolbar — visible on hover/focus-within */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex items-center justify-between p-2",
          "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          // Always visible on touch devices
          "touch-action-none [@media(hover:none)]:opacity-100"
        )}
      >
        {/* Left: selection checkbox */}
        <div>
          {data.enableSelection && (
            <Button variant="ghost" size="icon" aria-label="Select item">
              <IconSquare className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right: platform actions + category actions */}
        <div className="flex items-center gap-0.5">
          <PlatformActions
            itemId={data.id}
            onFavorite={data.onFavorite}
            onShare={data.onShare}
            onViewMedia={data.onViewMedia}
          />
          {data.categoryActions?.map((action) => (
            <TooltipProvider key={action.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={action.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      action.onAction(data.id);
                    }}
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{action.label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Platform thumbnail actions — always present, template-owned.
 * Renders favorite, share, and viewMedia buttons with tooltips.
 */
function PlatformActions({
  itemId,
  onFavorite,
  onShare,
  onViewMedia,
}: {
  itemId: string;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onViewMedia?: (id: string) => void;
}) {
  const actions = [
    {
      id: "favorite",
      label: "Add to shortlist",
      icon: IconHeart,
      handler: onFavorite,
    },
    { id: "share", label: "Share", icon: IconShare, handler: onShare },
    {
      id: "viewMedia",
      label: "View media",
      icon: IconPhoto,
      handler: onViewMedia,
    },
  ];

  return (
    <>
      {actions.map((action) => (
        <TooltipProvider key={action.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={action.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.handler?.(itemId);
                }}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{action.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors. (The file is standalone — no other files depend on it yet.)

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/grid/plp-grid-thumbnail.tsx
git commit -m "feat(plp): extract PlpGridThumbnail sub-component with 360 media support"
```

---

## Task 4: Wire `PlpGridThumbnail` into `PlpGridItem`

**Files:**
- Modify: `packages/components/src/components/templates/plp/grid/plp-grid-item.tsx`

Replace the inline thumbnail block (and the now-duplicate `PlatformActions` helper) with a single `<PlpGridThumbnail data={data} />`.

- [ ] **Step 1: Replace the file contents**

Read the current file to verify it matches expectations, then replace its contents with:

```tsx
// plp/grid/plp-grid-item.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData } from "../plp-types";
import { PlpGridThumbnail } from "./plp-grid-thumbnail";

/**
 * Formats a number as a currency string.
 * Uses the user's locale for formatting conventions.
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Individual PLP grid item card.
 *
 * Renders all 10 fixed sections in spec order. Handles pricing variant
 * rendering based on item data and user context. The thumbnail block
 * (including hover action toolbar, optional 360 media, and selection
 * checkbox) is delegated to `PlpGridThumbnail`.
 *
 * This component is internal to the PLP template — not exported from
 * the package barrel.
 */
export function PlpGridItem({ data }: { data: GridItemData }) {
  const userContext = usePlpUserContext();

  return (
    <article
      className="group relative flex flex-col"
      data-slot="plp-grid-item"
    >
      {/* 1. Thumbnail */}
      <PlpGridThumbnail data={data} />

      {/* 2. Name */}
      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">
        {data.name}
      </h3>

      {/* 3. Lead (optional slot) */}
      {data.lead && (
        <div className="mt-0.5 text-xs text-muted-foreground">{data.lead}</div>
      )}

      {/* 4. Badges (optional) */}
      {data.badges && data.badges.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">{data.badges}</div>
      )}

      {/* 5. Category slot top (optional) */}
      {data.categorySlotTop && (
        <div className="mt-1.5">{data.categorySlotTop}</div>
      )}

      {/* 6. Delivery */}
      <div className="mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {data.delivery.isExpress && (
            <Badge variant="success" size="sm">
              Express
            </Badge>
          )}
          <span>
            Get it{" "}
            <span className="font-medium text-foreground">
              {data.delivery.estimatedDate}
            </span>
          </span>
        </div>
        <div>
          Ships from{" "}
          <span className="font-medium text-foreground">
            {data.delivery.shipsFrom}
          </span>
        </div>
      </div>

      {/* 7. Returns */}
      <div className="mt-1 text-xs text-muted-foreground">
        {data.returns.isReturnable ? (
          <span className="text-success">
            Returnable — Fair use policy applies
          </span>
        ) : (
          <span className="text-destructive">Non-returnable</span>
        )}
      </div>

      {/* 8. Pricing */}
      <PlpGridItemPricing pricing={data.pricing} userContext={userContext} />

      {/* 9. Category slot bottom (optional) */}
      {data.categorySlotBottom && (
        <div className="mt-1.5">{data.categorySlotBottom}</div>
      )}

      {/* 10. Primary action — hover-revealed on desktop, always visible on touch */}
      <div
        className={cn(
          "mt-3 invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          "[@media(hover:none)]:visible [@media(hover:none)]:opacity-100"
        )}
      >
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddToCart();
          }}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}

/**
 * Renders pricing variants based on item data and user context.
 *
 * Handles: tariff labels, discount (struck-through + percentage),
 * legacy two-line pricing, per-carat secondary line, multi-currency display.
 */
function PlpGridItemPricing({
  pricing,
  userContext,
}: {
  pricing: GridItemData["pricing"];
  userContext: { currency: string; location: string; pricingModel: string };
}) {
  const showTariffs = pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="mt-2 space-y-0.5">
      {/* Tariff label */}
      {showTariffs && (
        <div className="text-xs text-muted-foreground">
          Stone price{" "}
          <span className="underline decoration-dotted">
            including US tariffs
          </span>
        </div>
      )}

      {/* Discount line */}
      {pricing.discount && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-success">
            {pricing.discount.percentage}% below
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </span>
        </div>
      )}

      {/* Main price */}
      <div className="text-base font-bold text-foreground">
        {formatCurrency(pricing.amount, pricing.currency)}
      </div>

      {/* Per-carat secondary line */}
      {pricing.perCarat && (
        <div className="text-xs text-muted-foreground">
          {formatCurrency(pricing.perCarat.amount, pricing.perCarat.currency)}/ct
        </div>
      )}

      {/* Legacy delivered price */}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <div className="text-xs text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </div>
      )}

      {/* Multi-currency display */}
      {showMultiCurrency && (
        <div className="text-xs text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </div>
      )}
    </div>
  );
}
```

Note that the imports shrink: `IconHeart`, `IconShare`, `IconPhoto`, `IconSquare`, `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` are no longer needed here (they moved to `PlpGridThumbnail`). The `cn` import is retained (used by the add-to-cart wrapper) and the `Badge` import is retained (used by the Express badge in the delivery section).

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/grid/plp-grid-item.tsx
git commit -m "refactor(plp): delegate thumbnail rendering to PlpGridThumbnail"
```

---

## Task 5: Grid item story for 360 media

**Files:**
- Modify: `packages/components/src/components/templates/plp/grid/plp-grid-item.stories.tsx`

Add one new story `With360Media` that renders a grid item with `media360.videoUrl` populated. Use a short public sample MP4 so hovering in Storybook exercises the full crossfade + scrub path.

- [ ] **Step 1: Open the stories file and locate the end of the story exports**

The file already defines a `buildGridItemData` helper and several story exports (`Default`, `Express`, `NonReturnable`, etc.). The new story goes at the end of the file, after the last existing `export const ... : Story = { ... };`.

- [ ] **Step 2: Add the new story export**

Append to the file:

```tsx
export const With360Media: Story = {
  args: {
    data: buildGridItemData({
      media360: {
        // Short public sample — hover over the thumbnail to see the crossfade
        // and scrub behaviour. If this URL becomes unavailable, swap it for
        // another small MP4 from a stable public bucket.
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
    }),
  },
};
```

- [ ] **Step 3: Verify Storybook build**

```bash
cd packages/components && npx storybook build --quiet 2>&1 | tail -10
```

Expected: successful build.

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/grid/plp-grid-item.stories.tsx
git commit -m "feat(plp): add With360Media story for grid item thumbnail"
```

---

## Task 6: Sprinkle 360 media onto shared template stories

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-template.stories.tsx`

Make ~1/3 of mock items (gemstones and diamonds) include `media360` so the full PLP stories demonstrate the feature in a mixed content set.

- [ ] **Step 1: Add a shared sample video URL constant**

Near the top of the file, where the other mock helpers live (e.g. near `buildMockHistogram`, `mockSupplierSearch`), add:

```tsx
// Sample 360 rotation video — used for ~1/3 of mock items in PLP stories.
// If this URL becomes unavailable, swap for another small public MP4.
const SAMPLE_360_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
```

- [ ] **Step 2: Update `gemstoneRenderGridItem` to include media360 for every 3rd item**

Locate the `gemstoneRenderGridItem` function. Inside the returned object literal, add:

```tsx
    media360:
      Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
        ? { videoUrl: SAMPLE_360_VIDEO_URL }
        : undefined,
```

Place this field alongside the other grid item fields (e.g., after `onViewMedia: fn(),` or at the end of the object literal — order doesn't matter to the consumer contract).

The check extracts the numeric portion of `item.id` (the items are generated with IDs like `"gem-0"`, `"gem-1"`, etc. in `generateGemstoneItems`) and uses modulo 3 to pick every third item.

- [ ] **Step 3: Update `diamondRenderGridItem` the same way**

Locate the `diamondRenderGridItem` function and add the same `media360` line with the same modulo rule (diamond IDs are `"diamond-0"`, `"diamond-1"`, etc.).

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Verify Storybook build**

```bash
cd packages/components && npx storybook build --quiet 2>&1 | tail -10
```

Expected: successful build.

- [ ] **Step 6: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-template.stories.tsx
git commit -m "feat(plp): sprinkle 360 media onto a subset of mock items in PLP stories"
```

---

## Task 7: Update COMPONENT.md

**Files:**
- Modify: `packages/components/src/components/templates/plp/COMPONENT.md`

- [ ] **Step 1: Bump frontmatter version**

Change `version: 0.3.0` to `version: 0.4.0`. Keep `lastUpdated: 2026-04-16`.

- [ ] **Step 2: Document the `media360` field in the grid item data section**

Find the part of the file that describes `GridItemData` fields (likely in the props table or in a section describing what the `renderGridItem` mapper returns). Add a row or bullet for `media360`:

| Field | Type | Description |
|-------|------|-------------|
| `media360` | `{ videoUrl: string } \| undefined` | Optional 360 rotation video. When present and the viewport supports hover, the thumbnail crossfades into the video on hover and horizontal cursor position scrubs it. Omit to skip 360 on a per-item basis. |

If the file uses a bullet/list format instead of a table, insert a matching bullet.

- [ ] **Step 3: Add a short "360 media (Phase 3b)" note to the Usage guidelines section**

Append a small subsection after the existing Phase 2/3a notes:

```md
### 360 media (Phase 3b)

Grid items with 360 rotation video opt in via the `media360.videoUrl` field on `GridItemData`. On pointer devices, hovering the thumbnail crossfades the static image into the video and horizontal cursor movement scrubs through the rotation. Videos are lazy-loaded via intersection observer, so off-screen items don't consume bandwidth until they scroll into view.

Touch devices skip the 360 code path entirely — no video element is mounted, no network requests are issued. Touch users access 360 content through the `viewMedia` platform action, which is expected to open a Lightbox (separate spec).

Encode source videos with dense keyframes (e.g. a keyframe every 2–3 frames) for smooth seek-based scrubbing. Sparse-keyframe videos will stutter when the cursor moves quickly.
```

- [ ] **Step 4: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/COMPONENT.md
git commit -m "docs(plp): document Phase 3b media360 field in COMPONENT.md"
```

---

## Task 8: Final verification + CHANGELOG + spec status

- [ ] **Step 1: TypeScript check**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Unit tests**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx vitest run --project unit
```

Expected: 14 tests PASS (no regressions from Phase 3a).

- [ ] **Step 3: Storybook build**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx storybook build --quiet 2>&1 | tail -10
```

Expected: successful build.

- [ ] **Step 4: Gather Phase 3b commit SHAs**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git log --oneline feat/plp-template --not dev | head -10
```

Identify the Phase 3b commits (everything since the Phase 3a spec-status commit). Approximate ordering:
- COMPONENT.md update (just committed above)
- Stories sprinkle 360 media
- Grid item story With360Media
- PlpGridItem delegates to PlpGridThumbnail
- PlpGridThumbnail created
- useHasHover hook
- media360 field added to GridItemData

Use actual SHAs from `git log` output.

- [ ] **Step 5: Prepend Phase 3b entry to CHANGELOG**

Open `packages/components/CHANGELOG.md`. Directly after the `# Changelog — @nivoda/components` header (and above the Phase 3a entry), prepend:

```md
### PLP Template — Phase 3b (unstable 0.4.0)

Adds 360 rotatable media on hover to the PLP grid thumbnail. On pointer devices, items with a `media360.videoUrl` crossfade from their static image into a rotating video; horizontal cursor movement scrubs through the rotation. Touch devices skip the 360 code path entirely.

- New optional `media360: { videoUrl: string }` field on `GridItemData` — category opt-in per item (`<SHA-types>`)
- New `useHasHover` hook gating the entire 360 path on pointer-device detection — no video element mounts on touch (`<SHA-hook>`)
- Extracted `PlpGridThumbnail` sub-component owning the static image, optional 360 video with lazy intersection-observer loading and mousemove scrubbing, hover action toolbar, and selection checkbox (`<SHA-thumbnail>`)
- `PlpGridItem` simplified to delegate thumbnail rendering to `PlpGridThumbnail` (`<SHA-griditem>`)
- Storybook: new `With360Media` grid item story; ~1/3 of mock items in PLP stories now include `media360` (`<SHA-griditem-story>`, `<SHA-template-stories>`)
- COMPONENT.md bumped to 0.4.0 with `media360` field and encoding guidance documented (`<SHA-docs>`)

---
```

Replace `<SHA-*>` placeholders with actual short SHAs.

Commit:
```bash
git add packages/components/CHANGELOG.md
git commit -m "docs(plp): add Phase 3b entry to package CHANGELOG"
```

- [ ] **Step 6: Mark Phase 3b design spec as Implemented**

Edit `docs/plans/specs/2026-04-16-plp-template-phase3b-design.md` frontmatter:

Change `status: Draft` to `status: Implemented`.

Commit:
```bash
git add docs/plans/specs/2026-04-16-plp-template-phase3b-design.md
git commit -m "docs(plp): mark Phase 3b spec as implemented"
```

- [ ] **Step 7: Final report**

Report back:
- TypeScript + unit tests + Storybook build results
- Total commit count on branch vs dev (`git log --oneline feat/plp-template --not dev | wc -l`)
- List of Phase 3b commit SHAs with subjects
- Any deviations from the plan
