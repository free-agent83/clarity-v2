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
