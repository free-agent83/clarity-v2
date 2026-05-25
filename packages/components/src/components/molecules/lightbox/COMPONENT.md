---
name: Lightbox
slug: lightbox
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Lightbox

Full-screen media viewer for images and 360° video. System-wide — not PDP-specific. Any component in the system can use it.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `media` | `ProductMedia[]` | required | Images and/or a 360° video to display |
| `initialIndex` | `number` | `0` | Which item to show first |
| `onClose` | `() => void` | required | Called when user closes the lightbox |

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
- `ArrowLeft` / `ArrowRight` — previous / next item

## 360° video

When a `video360` item is active, a scrub bar is always visible (desktop and mobile). Drag the thumb left/right to rotate the video.

## Best practices

**Do:** Render Lightbox conditionally (`{idx !== null && <Lightbox ... />}`) and control open/close state in the consumer. The consumer owns whether the lightbox is open.

**Don't:** Keep Lightbox always mounted — it uses fixed positioning and will block page interactions when open.

## Quality checklist

- [x] `role="dialog"` + `aria-modal="true"` on the overlay
- [x] Keyboard: Escape closes, ArrowLeft/ArrowRight navigate
- [x] Close and nav buttons have `aria-label`
- [x] Scrub bar always visible for 360° items (no hover dependency inside Lightbox)
- [x] Tokens only — no hardcoded colours

## Live component

<StorybookEmbed story="overlays-lightbox--default" />
