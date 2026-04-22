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

function ScrubBar({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
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
