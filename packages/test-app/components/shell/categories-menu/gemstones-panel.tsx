import * as React from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { MegamenuLink, Typography } from "@nivoda/components";

const GEMSTONES_BASE = "/buyer/browse/gemstones";

const POPULAR_TYPES = [
  "Sapphire",
  "Emerald",
  "Ruby",
  "Tourmaline",
  "Aquamarine",
  "Tanzanite",
  "Alexandrite",
  "Opal",
  "Garnet",
  "Topaz",
] as const;

function slug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Megamenu panel for the Gemstones category. A 2-column grid of the
 * most-shopped types with a "See all" link beneath.
 */
export function GemstonesPanel() {
  return (
    <div className="flex flex-col gap-3 p-6">
      <Typography variant="subtitle-2" className="mb-2 pl-3">
        Popular gemstone types
      </Typography>
      <div className="grid grid-flow-col grid-rows-5 gap-x-8">
        {POPULAR_TYPES.map((label) => (
          <MegamenuLink
            key={label}
            href={`${GEMSTONES_BASE}?type=${slug(label)}`}
            title={label}
            leading={<div className="size-9 rounded bg-muted" />}
          />
        ))}
      </div>
      <Link
        href={GEMSTONES_BASE}
        className="ml-3 mt-2 inline-flex items-center gap-1 self-start text-sm font-medium text-foreground hover:underline"
      >
        See all gemstone types
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
}
