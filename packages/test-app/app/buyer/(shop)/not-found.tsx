"use client";

import Link from "next/link";
import { Button } from "@nivoda/components";
import { IconHome, IconSearch } from "@tabler/icons-react";

const FACETS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  delay: i * 0.15,
  angle: i * 30,
}));

function SpinningDiamond() {
  return (
    <div className="group relative cursor-pointer">
      {/* Sparkle particles */}
      {FACETS.map((f) => (
        <span
          key={f.id}
          className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-chart-1"
          style={{
            animation: `sparkle 2s ${f.delay}s ease-in-out infinite`,
            transform: `rotate(${f.angle}deg) translateY(-80px)`,
            opacity: 0,
          }}
        />
      ))}

      {/* Diamond SVG */}
      <svg
        viewBox="0 0 120 120"
        className="size-40 drop-shadow-lg"
        style={{
          animation: "diamondFloat 3s ease-in-out infinite",
          filter: "drop-shadow(0 0 15px oklch(0.811 0.111 293.571 / 0.5))",
          transition: "filter 0.3s ease",
        }}
      >
        {/* Top facets */}
        <polygon points="60,8 35,42 85,42" fill="oklch(0.811 0.111 293.571)" />
        <polygon points="60,8 10,42 35,42" fill="oklch(0.606 0.25 292.717)" />
        <polygon points="60,8 85,42 110,42" fill="oklch(0.606 0.25 292.717)" />
        {/* Bottom facets */}
        <polygon
          points="35,42 85,42 60,112"
          fill="oklch(0.541 0.281 293.009)"
        />
        <polygon points="10,42 35,42 60,112" fill="oklch(0.491 0.27 292.581)" />
        <polygon
          points="85,42 110,42 60,112"
          fill="oklch(0.491 0.27 292.581)"
        />
        {/* Shine line */}
        <polygon
          points="45,30 50,42 38,42"
          fill="white"
          opacity="0.4"
          style={{ animation: "shimmer 3s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}

function FloatingNumber() {
  return (
    <span
      className="inline-block transition-all duration-700"
      style={{
        opacity: 1,
        transform: "translateY(0)",
      }}
    >
      404
    </span>
  );
}

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes diamondFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes diamondBounce {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.15) rotate(-5deg); }
          60% { transform: scale(0.95) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: rotate(var(--angle)) translateY(-80px) scale(0); }
          50% { opacity: 1; transform: rotate(var(--angle)) translateY(-100px) scale(1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <SpinningDiamond />

        <h1 className="text-7xl font-bold tracking-tight text-foreground">
          <FloatingNumber />
        </h1>

        <div className="flex max-w-md flex-col gap-2">
          <p className="text-xl font-semibold text-foreground">
            This gem couldn&apos;t be found
          </p>
          <p className="text-base text-muted-foreground">
            Looks like this page is rarer than a flawless D-color diamond. It
            may have been moved, removed, or never existed in the first place.
          </p>
        </div>

        <p className="mt-8 text-sm text-muted-foreground/60">
          Think something should be here?{" "}
          <span className="text-foreground underline">Contact support</span>.
        </p>
      </div>
    </>
  );
}
