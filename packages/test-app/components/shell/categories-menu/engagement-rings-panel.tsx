import * as React from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { Button, cn, MegamenuLink, Typography } from "@nivoda/components";

const ENGAGEMENT_BASE = "/buyer/browse/jewelry/engagement-rings";

const STYLES = [
  "Bezel",
  "Cathedral",
  "Channel",
  "Halo",
  "Nature",
  "Pave",
  "Side Stone",
  "Solitaire",
  "Three Stone",
  "Two Stone",
] as const;

const SHAPES = [
  "Asscher",
  "Cushion",
  "Emerald",
  "Heart",
  "Marquise",
  "Oval",
  "Pear",
  "Princess",
  "Radiant",
  "Round",
] as const;

const METALS = [
  "Yellow gold",
  "Rose gold",
  "White gold",
  "Platinum",
] as const;

function slug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PanelSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <Typography variant="subtitle-2" className="mb-3 pl-3">
        {title}
      </Typography>
      {children}
    </section>
  );
}

function FlowGridFiveByTwo({
  items,
  param,
}: {
  items: ReadonlyArray<string>;
  param: string;
}) {
  return (
    <div className="grid grid-flow-col grid-rows-5 gap-x-6">
      {items.map((label) => (
        <MegamenuLink
          key={label}
          href={`${ENGAGEMENT_BASE}?${param}=${slug(label)}`}
          title={label}
          leading={<div className="size-6 rounded bg-muted" />}
        />
      ))}
    </div>
  );
}

function MetalColumn({
  items,
  param,
}: {
  items: ReadonlyArray<string>;
  param: string;
}) {
  return (
    <div className="flex flex-col">
      {items.map((label) => (
        <MegamenuLink
          key={label}
          href={`${ENGAGEMENT_BASE}?${param}=${slug(label)}`}
          title={label}
          leading={<div className="size-6 rounded-full bg-muted" />}
        />
      ))}
    </div>
  );
}

function RingStudioBanner() {
  return (
    <div
      data-slot="categories-menu-banner"
      className="m-3 grid overflow-hidden rounded-md border border-border bg-muted/40 lg:grid-cols-[1fr_320px]"
    >
      <div className="flex flex-col items-start gap-3 p-6">
        <Typography variant="h4">The Ring Studio</Typography>
        <Typography variant="body-2" className="text-muted-foreground">
          Customize everything in realtime. Manufactured and delivered at the
          same Nivoda speed and quality.
        </Typography>
        <Button asChild size="sm" className="mt-1">
          <Link href="/buyer/browse/custom-jewellery">
            Customize my own jewelry
            <IconArrowRight />
          </Link>
        </Button>
      </div>
      <div
        aria-hidden="true"
        className="hidden bg-gradient-to-br from-muted to-muted-foreground/20 lg:block"
      />
    </div>
  );
}

/**
 * Megamenu panel for the Engagement rings category. Three sections —
 * by style, by stone shape, by metal — followed by The Ring Studio
 * promo banner.
 */
export function EngagementRingsPanel() {
  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-6 p-6",
          "lg:grid-cols-[2fr_2fr_1fr]"
        )}
      >
        <PanelSection title="By style">
          <FlowGridFiveByTwo items={STYLES} param="style" />
        </PanelSection>
        <PanelSection title="By stone shape">
          <FlowGridFiveByTwo items={SHAPES} param="shape" />
        </PanelSection>
        <PanelSection title="By metal">
          <MetalColumn items={METALS} param="metal" />
        </PanelSection>
      </div>

      <RingStudioBanner />
    </>
  );
}
