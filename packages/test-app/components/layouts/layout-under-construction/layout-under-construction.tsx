"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@nivoda/components";
import { IconArrowLeft } from "@tabler/icons-react";

const DUST_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  delay: i * 0.25,
  x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 40),
}));

function HardHatDiamond() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dust particles on hover */}
      {DUST_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-amber-400"
          style={{
            animation: hovered
              ? `dust 0.8s ${p.delay * 0.1}s ease-out forwards`
              : "none",
            opacity: 0,
          }}
        />
      ))}

      <svg
        viewBox="0 0 120 130"
        className="size-40 drop-shadow-lg"
        style={{
          animation: hovered
            ? "constructionBounce 0.5s ease"
            : "constructionFloat 3s ease-in-out infinite",
          filter: `drop-shadow(0 0 ${hovered ? "30px" : "15px"} oklch(0.795 0.184 86.047 / 0.5))`,
          transition: "filter 0.3s ease",
        }}
      >
        {/* Hard hat */}
        <ellipse
          cx="60"
          cy="38"
          rx="42"
          ry="6"
          fill="oklch(0.795 0.184 86.047)"
        />
        <path
          d="M25,38 Q25,15 60,12 Q95,15 95,38"
          fill="oklch(0.852 0.199 91.936)"
        />
        <rect
          x="22"
          y="35"
          width="76"
          height="8"
          rx="3"
          fill="oklch(0.795 0.184 86.047)"
        />
        {/* Stripe on hat */}
        <rect
          x="30"
          y="22"
          width="60"
          height="4"
          rx="2"
          fill="white"
          opacity="0.3"
        />

        {/* Diamond body (shifted down to sit under hat) */}
        <polygon points="60,42 35,68 85,68" fill="oklch(0.811 0.111 293.571)" />
        <polygon points="60,42 18,68 35,68" fill="oklch(0.606 0.25 292.717)" />
        <polygon points="60,42 85,68 102,68" fill="oklch(0.606 0.25 292.717)" />
        <polygon
          points="35,68 85,68 60,125"
          fill="oklch(0.541 0.281 293.009)"
        />
        <polygon points="18,68 35,68 60,125" fill="oklch(0.491 0.27 292.581)" />
        <polygon
          points="85,68 102,68 60,125"
          fill="oklch(0.491 0.27 292.581)"
        />
        {/* Shine */}
        <polygon
          points="45,56 50,68 38,68"
          fill="white"
          opacity="0.4"
          style={{ animation: "shimmer 3s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}

function AnimatedTitle({ children }: { children: string }) {
  return (
    <span
      className="inline-block transition-all duration-700"
      style={{
        opacity: 1,
        transform: "translateY(0)",
      }}
    >
      {children}
    </span>
  );
}

type LayoutUnderConstructionProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function LayoutUnderConstruction({
  title,
  description = "We're polishing this section to perfection. Check back soon — it'll be worth the wait.",
  backHref = "/buyer",
  backLabel = "Back to home",
}: LayoutUnderConstructionProps) {
  return (
    <>
      <style>{`
        @keyframes constructionFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        @keyframes constructionBounce {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.12) rotate(3deg); }
          60% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        @keyframes dust {
          0% { opacity: 0.8; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx), -40px) scale(0); }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <HardHatDiamond />

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          <AnimatedTitle>{title}</AnimatedTitle>
        </h1>

        <div className="flex max-w-md flex-col gap-2">
          <p className="text-base text-muted-foreground">{description}</p>
        </div>

        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <IconArrowLeft size={16} />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
