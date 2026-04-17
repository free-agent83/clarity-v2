---
title: PLP Template — Phase 3b Implementation Design
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-16
status: Draft
parent: docs/plans/specs/2026-04-16-plp-template-component-spec.md
predecessor: docs/plans/specs/2026-04-16-plp-template-phase3a-design.md
tags:
  - design-system
  - plp
  - phase-3b
  - 360-media
  - implementation-design
---

# PLP Template — Phase 3b Implementation Design

## Scope

Phase 3b adds **360 rotatable media on hover** to the PLP grid item. When a product has a 360 video asset and the user hovers over the thumbnail on a pointer device, the static image crossfades into the video, and horizontal cursor movement scrubs through the rotation — producing the perception of rotating the product by hand.

### Phase 3b includes

- New optional `media360` field on `GridItemData` — category supplies video URL per-item
- `<video>` element mounted behind the static image when `media360` is present on pointer devices
- Crossfade from static image to video on hover (150ms, ease-out)
- Horizontal cursor position within the thumbnail maps to `video.currentTime`
- Video lazy-loading via intersection observer — starts loading when item enters viewport
- Touch devices skip the 360 code path entirely — no video element mounted, no network requests
- Grid item stories gain a `With360Media` variant demonstrating the interaction
- Shared stories updated so a subset of items include `media360` data

### Phase 3b excludes

- Touch-native 360 rotation in grid view (architectural spec §9.3 — deferred indefinitely)
- Lightbox that hosts 360 for touch users (spec'd separately, out of scope)
- Sprite sheet fallback for environments where `<video>` seeking is janky (not planned)
- Keyboard 360 interaction (architectural spec §5.1 explicitly waives the keyboard equivalent; static image remains fully accessible)
- Preloading videos that aren't in the viewport (all lazy)
- 360 in list view (list view uses static thumbnails per §4.1)

### Relationship to Phase 1–3a

No changes to any existing behaviour. One new optional field on `GridItemData`. One new hook (`useHasHover`). The grid item's thumbnail block is extracted into a sub-component to keep `plp-grid-item.tsx` manageable.

---

## 1. Data shape

Add one optional field to `GridItemData`:

```ts
export interface GridItemData {
  // ...existing fields
  /**
   * Optional 360 rotation video. When present and the viewport supports
   * hover (pointer devices), the grid item's thumbnail crossfades from
   * the static image into this video on hover, and horizontal cursor
   * movement scrubs the video's currentTime.
   *
   * Touch devices ignore this field entirely — no video element is mounted.
   * The Lightbox (out of scope for Phase 3b) is the touch-side experience
   * for 360 media.
   */
  media360?: {
    /**
     * URL to an MP4 or WebM containing the full rotation sequence.
     * Encode with dense keyframes (short GOP, ~every 2-3 frames) for
     * smooth scrubbing — seeking a sparse keyframe video will stutter.
     */
    videoUrl: string;
  };
}
```

Presence enables the feature per-item. Category decides in `renderGridItem` whether to supply the field for each item (de facto suppression via absence — no explicit `suppress` config).

---

## 2. Interaction behaviour

### Hover crossfade

Video and static image are both mounted when `media360` is present and the device has hover. Static image sits on top of the video, with opacity 1 by default. On hover/focus-within of the thumbnail container:

- Static image `opacity` transitions to 0 over 150ms, ease-out
- Video `opacity` stays at 1 — it's always visible underneath, just hidden by the image
- On mouse leave, the image opacity returns to 1

This means the video is already loaded and playing-ready when hover starts; no mount/unmount transition needed. Cleaner than crossfading two elements against each other.

### Scrubbing

- Video element starts with `preload="metadata"` so duration is known without full load
- Video is `muted`, `playsInline`, and initially paused at frame 0
- On `mousemove` over the thumbnail:
  - Calculate `x` = cursor's horizontal position relative to the thumbnail container
  - Calculate `pct` = `x / thumbnailWidth`, clamped 0–1
  - Set `video.currentTime = pct * video.duration`
- No `play()` call — the video never plays on its own; it only moves in response to cursor

Scrubbing frame rate is governed by the browser's `mousemove` event rate (~60Hz on most devices) and by the video's keyframe density. A video encoded with a keyframe every 2–3 frames will scrub smoothly; a video encoded with 1-second keyframes will stutter. Quality of the scrubbing experience is on the encoding side, which the backend owns.

### Mouse leave reset

On mouse leave, `video.currentTime` is set back to 0 (first frame). Otherwise the next hover would start from wherever the cursor was last time, which feels glitchy.

---

## 3. Loading strategy

Video loading is tied to the viewport via intersection observer, to avoid loading 20+ videos on page load.

### Observer behaviour

- A single `IntersectionObserver` is created per grid item (lightweight — the browser batches observations efficiently; a shared observer across items would require a registry that isn't worth the complexity for this phase)
- Threshold: 0.1 (10% of the thumbnail visible) triggers the load
- `rootMargin: "200px 0px"` — load a bit before items enter the viewport, so the video is typically ready by the time the user hovers

### Transitions

- Initial render: `<video preload="metadata" src={...} />` — mounted with minimal network (just headers + moov box for duration)
- When intersection observer fires: swap `preload` to `"auto"` — triggers full video download
- Once loaded (video `readyState >= 2`): video is ready for smooth scrubbing
- If the user hovers before full load completes, scrubbing still works on whatever portion of the video has buffered; the seek either jumps to the nearest buffered frame or waits briefly. Browsers handle this gracefully.

### Skip entirely on touch

- The grid item uses a `useHasHover` hook (new in this phase) that returns `true` when `matchMedia("(hover: hover)")` matches
- When `useHasHover()` returns `false`, the entire video rendering path is skipped: no `<video>` element, no intersection observer, no mousemove handler
- The static image renders alone, styled as though `media360` was never present

---

## 4. Touch and keyboard behaviour

### Touch (no hover)

- `useHasHover()` returns `false`
- No video element is mounted in the DOM
- No network requests for video
- Hover crossfade CSS classes are still present but never trigger (no hover state)
- The platform `viewMedia` thumbnail action remains the path for accessing 360 content on touch (opens a Lightbox, out of scope for this phase)

### Keyboard

- Focus still works on the thumbnail link / card — keyboard users can navigate to items normally
- 360 is not activated on focus (deliberate per architectural spec §5.1 — "progressive enhancement, no keyboard equivalent required")
- Image does not fade on focus-within of the card because we don't want keyboard-only users to lose sight of the static image while navigating
- If a future phase decides to add a keyboard-triggered 360 (e.g., arrow keys scrub), the data shape supports it

---

## 5. Component decomposition

The current `plp-grid-item.tsx` renders the thumbnail block inline. Adding the 360 logic (video element, intersection observer, mousemove handler, hover-based crossfade) would push that block past a reasonable size.

**Proposal:** extract the thumbnail block into its own file `plp/grid/plp-grid-thumbnail.tsx`.

Responsibilities of the new sub-component:
- Render the static image
- Render the optional video element (when `media360` is present and device has hover)
- Own the intersection observer for video lazy-loading
- Own the mousemove → currentTime scrubbing logic
- Render the hover-revealed action toolbar (currently inline in grid item)
- Render the selection checkbox (currently inline)
- Handle the `group-hover` container class

The grid item becomes responsible only for ordering the card's 10 sections, and delegates thumbnail rendering to `PlpGridThumbnail`.

This decomposition is purely internal — no consumer API changes. The grid item file stays below ~250 lines; the new thumbnail file handles ~150 lines of thumbnail-specific logic.

### File structure

```
plp/grid/
├── plp-grid.tsx                   (unchanged)
├── plp-grid-item.tsx              (modified — delegates thumbnail to sub-component)
├── plp-grid-thumbnail.tsx         NEW — thumbnail with static image + optional 360 video + hover toolbar + selection
├── plp-grid-item.stories.tsx      (modified — add `With360Media` story)
└── plp-grid-skeleton.tsx          (unchanged)

plp/hooks/
├── use-is-tablet-up.ts            (unchanged, from Phase 2)
└── use-has-hover.ts               NEW — matchMedia hook for pointer hover capability
```

---

## 6. `useHasHover` hook

Matches the existing `useIsTabletUp` / `useIsMobile` pattern.

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

---

## 7. `PlpGridThumbnail` sketch

Not a complete implementation — just the shape, to illustrate how pieces fit together. Full implementation comes in the plan.

```tsx
function PlpGridThumbnail({ data }: { data: GridItemData }) {
  const hasHover = useHasHover();
  const canRender360 = hasHover && !!data.media360;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInViewport, setVideoInViewport] = useState(false);

  // Intersection observer for lazy video load
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

  // Upgrade preload when visible
  useEffect(() => {
    if (!videoInViewport || !videoRef.current) return;
    videoRef.current.preload = "auto";
    videoRef.current.load();
  }, [videoInViewport]);

  function handleMouseMove(e: React.MouseEvent) {
    if (!canRender360 || !videoRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const video = videoRef.current;
    if (video.duration && Number.isFinite(video.duration)) {
      video.currentTime = pct * video.duration;
    }
  }

  function handleMouseLeave() {
    if (videoRef.current) videoRef.current.currentTime = 0;
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

      {/* Static image (always rendered; fades out on hover when 360 available) */}
      <img
        src={data.thumbnailSrc}
        alt={data.thumbnailAlt}
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ease-out",
          canRender360 && "group-hover:opacity-0"
        )}
      />

      {/* Hover action toolbar + selection checkbox live here
         (existing code moved from plp-grid-item.tsx) */}
    </div>
  );
}
```

Relevant behaviour captured:
- Video never mounts on touch (guarded by `canRender360`)
- Static image fades on hover only when a video exists — items without `media360` get a static-only thumbnail and no fade behaviour
- `mousemove` / `mouseleave` handlers are conditional on `canRender360` — not attached at all on touch or for items without 360 data
- Intersection observer only runs on pointer devices with 360 data

---

## 8. Grid item changes

The thumbnail block currently inline in `plp-grid-item.tsx` is removed and replaced with `<PlpGridThumbnail data={data} />`. The action toolbar logic (platform actions, category actions, selection checkbox) moves into `plp-grid-thumbnail.tsx`.

No changes to:
- `GridItemData` beyond adding the optional `media360` field
- Pricing rendering
- Delivery / returns / category slots
- Any other fixed sections

---

## 9. Storybook changes

### `plp-grid-item.stories.tsx`

Add one new story:

| Story | Purpose |
|-------|---------|
| `With360Media` | Item with a `media360.videoUrl` populated with a small sample MP4. Hovering in Storybook triggers the crossfade and scrub. |

For the sample MP4, use a short public CDN asset (e.g., Google's commondatastorage buckets provide sample rotating product MP4s) or a locally committed fixture if the team prefers. For this phase, use a placeholder URL that may or may not load — the important thing is exercising the code path. A small ~500KB sample is ideal.

Use a real-looking URL like `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` for demonstration. If the network fails, the crossfade still happens, just to a black video — acceptable for Storybook.

### `plp-template.stories.tsx`

Modify `generateGemstoneItems` and `generateDiamondItems` so roughly every third item gets a `media360.videoUrl`, demonstrating the feature in the mixed-content stories. Items without it behave as before.

---

## 10. Accessibility

No new accessibility concerns — 360 is a pointer-device progressive enhancement:
- Video element has no role or aria-label — it's decorative
- Static image still has its meaningful `alt` text driven by `thumbnailAlt`
- Screen readers see the static image, not the video
- Keyboard users navigate normally; hover-based 360 never activates
- Touch users don't even have a video in the DOM

The only A11y-adjacent decision is the absence of a visible "360 available" indicator (badge, icon overlay). Leaving that out for Phase 3b — if user research later shows discoverability problems, we can add an indicator in a follow-up phase.

---

## 11. Performance notes

- Videos start with `preload="metadata"` (~10KB per item) — cheap even for 20-item pages.
- Intersection observer is per-item (simplification; could share one observer in a future optimisation if perf becomes an issue).
- Full video download triggered only when the thumbnail is within 200px of the viewport.
- No full-video preload ever happens on touch devices.
- `currentTime` seeking is cheap on browsers as long as the video encoding has dense keyframes.
- On slow connections, first hover may show a brief stutter while the video buffers; scrubbing picks up smoothly once enough is buffered. Acceptable degradation.

---

## 12. Not responsible for

- Encoding guidance for 360 videos — category / backend owns this. A README note in COMPONENT.md will mention "encode with dense keyframes for smooth scrubbing".
- Lightbox integration for touch users — separate spec.
- Serving different video quality tiers based on connection speed or viewport size — a follow-up optimisation if needed.
- Detecting a "360 available" indicator in grid view — not in scope.
