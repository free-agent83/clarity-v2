import type { ReactNode } from "react";
import { FilterSection } from "../../../organisms/filter-toolbar/filter-toolbar";
import { RangeFilter } from "../../../molecules/range-filter/range-filter";
import type { RangeAxis } from "../../../molecules/range-filter/range-filter";
import type { BreadcrumbSegment } from "../plp-types";
import { PlpPageShell } from "./plp-page-shell";
import { SORT_OPTIONS } from "./sort-options";
import {
  StaticChipSelectFilter,
  StaticChipSection,
  type StaticChipOption,
} from "./static-filters";

const SHAPE_OPTIONS: StaticChipOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
  { value: "princess", label: "Princess" },
];

const COLOR_OPTIONS: StaticChipOption[] = ["D", "E", "F", "G", "H", "I"].map(
  (c) => ({ value: c, label: c })
);

const CLARITY_OPTIONS: StaticChipOption[] = [
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
].map((c) => ({ value: c, label: c }));

const PRICE_AXIS: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
};

const DIAMOND_FILTERS: ReactNode[] = [
  <StaticChipSelectFilter key="shape" label="Shape" options={SHAPE_OPTIONS} />,
  <StaticChipSelectFilter key="color" label="Color" options={COLOR_OPTIONS} />,
];

const DIAMOND_DRAWER: ReactNode = (
  <>
    <StaticChipSection label="Shape" options={SHAPE_OPTIONS} separator={false} />
    <StaticChipSection label="Color" options={COLOR_OPTIONS} />
    <StaticChipSection label="Clarity" options={CLARITY_OPTIONS} />
    <FilterSection label="Price">
      <RangeFilter value={undefined} onChange={() => {}} axes={[PRICE_AXIS]} />
    </FilterSection>
  </>
);

const DEFAULT_BREADCRUMBS: BreadcrumbSegment[] = [
  { label: "Diamonds", href: "#" },
  { label: "Natural" },
];

export function DiamondPage({
  breadcrumbs = DEFAULT_BREADCRUMBS,
  title = "Natural Diamonds",
  resultsCount = 48291,
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
      filters={DIAMOND_FILTERS}
      drawerContent={DIAMOND_DRAWER}
      searchPlaceholder="Search by certificate number or stock ID..."
      sortOptions={SORT_OPTIONS}
      actions={actions}
    >
      {children}
    </PlpPageShell>
  );
}
