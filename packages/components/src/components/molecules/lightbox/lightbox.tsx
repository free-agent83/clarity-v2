"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { LightboxProps, ProductMedia } from "../../templates/pdp/pdp-types";

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
 * scrub bar always visible. System-wide — not PDP-specific.
 *
 * Keyboard: Escape closes, ArrowLeft/ArrowRight navigate.
 */
export function Lightbox({ media, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, media.length - 1)));
  const dialogRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => setIndex((i) => (i - 1 + media.length) % media.length), [media.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % media.length), [media.length]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

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
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="Media lightbox"
      data-slot="lightbox"
    >
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
