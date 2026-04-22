"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useHasHover } from "../../../hooks/use-has-hover";
import { Slider } from "../../atoms/slider/slider";
import type { PdpMediaGalleryProps, ProductMedia } from "./pdp-types";

function Thumbnail({ item, selected, onClick }: { item: ProductMedia; selected: boolean; onClick: () => void }) {
  const src = item.type === "image" ? (item.thumbnailSrc ?? item.src) : (item.poster ?? "");
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-16 w-16 shrink-0 rounded-md overflow-hidden border transition-[border-color,box-shadow]",
        selected
          ? "border-transparent ring-2 ring-offset-1 ring-accent-foreground"
          : "border-transparent hover:border-muted-foreground/40"
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
  const handleValueChange = (values: number[]) => {
    const video = videoRef.current;
    const ratio = (values[0] ?? 0) / 100;
    if (video && video.duration) {
      video.currentTime = ratio * video.duration;
    }
  };

  return (
    <div
      className="absolute inset-x-3 bottom-3 flex flex-col gap-2 rounded-2xl bg-black/60 px-4 py-3"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="text-center text-xs font-medium text-white/80">Drag to rotate</span>
      <Slider defaultValue={[0]} min={0} max={100} step={0.1} onValueChange={handleValueChange} aria-label="Scrub 360° view" />
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
        {scrubVisible && <ScrubBar videoRef={videoRef} />}
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
 * Fires `onMediaClick(index)` on main view click — consumer opens Lightbox.
 *
 * Desktop 360°: scrub bar appears on hover; clicking fires `onMediaClick`.
 * Mobile 360°: no scrub bar in gallery — tap fires `onMediaClick` to open Lightbox where scrub is available.
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
