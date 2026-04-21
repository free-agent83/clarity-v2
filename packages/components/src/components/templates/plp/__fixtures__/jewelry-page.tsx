import type { ReactNode } from "react";
import type { BreadcrumbSegment } from "../plp-types";
import { PlpPageShell } from "./plp-page-shell";
import { JEWELRY_SORT_OPTIONS } from "./sort-options";
import {
  StaticChipSelectFilter,
  StaticChipSection,
  type StaticChipOption,
} from "./static-filters";

const STONE_SHAPE_OPTIONS: StaticChipOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
];

const METAL_OPTIONS: StaticChipOption[] = [
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "silver", label: "Silver" },
];

const STYLE_OPTIONS: StaticChipOption[] = [
  { value: "solitaire", label: "Solitaire" },
  { value: "halo", label: "Halo" },
  { value: "three-stone", label: "Three stone" },
];

const JEWELRY_FILTERS: ReactNode[] = [
  <StaticChipSelectFilter key="metal" label="Metal" options={METAL_OPTIONS} />,
  <StaticChipSelectFilter key="style" label="Style" options={STYLE_OPTIONS} />,
];

const JEWELRY_DRAWER: ReactNode = (
  <>
    <StaticChipSection
      label="Stone shape"
      options={STONE_SHAPE_OPTIONS}
      separator={false}
    />
    <StaticChipSection label="Metal" options={METAL_OPTIONS} />
    <StaticChipSection label="Style" options={STYLE_OPTIONS} />
  </>
);

const DEFAULT_BREADCRUMBS: BreadcrumbSegment[] = [
  { label: "Jewelry", href: "#" },
  { label: "Wedding rings" },
];

export function JewelryPage({
  breadcrumbs = DEFAULT_BREADCRUMBS,
  title = "Wedding rings",
  resultsCount = 1234567,
  banner,
  actions,
  children,
}: {
  breadcrumbs?: BreadcrumbSegment[];
  title?: string;
  resultsCount?: number;
  banner?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PlpPageShell
      breadcrumbs={breadcrumbs}
      title={title}
      resultsCount={resultsCount}
      banner={banner}
      filters={JEWELRY_FILTERS}
      drawerContent={JEWELRY_DRAWER}
      sortOptions={JEWELRY_SORT_OPTIONS}
      actions={actions}
    >
      {children}
    </PlpPageShell>
  );
}
