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

const COLOR_OPTIONS: StaticChipOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

const CLARITY_OPTIONS: StaticChipOption[] = [
  { value: "eye-clean", label: "Eye clean" },
  { value: "slightly-included", label: "Slightly included" },
  { value: "moderately-included", label: "Moderately included" },
  { value: "visibly-included", label: "Visibly included" },
];

const TREATMENT_OPTIONS: StaticChipOption[] = [
  { value: "none", label: "None" },
  { value: "heated", label: "Heated" },
  { value: "oiled", label: "Oiled" },
];

const PRICE_AXIS: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
};

const GEMSTONE_FILTERS: ReactNode[] = [
  <StaticChipSelectFilter key="color" label="Color" options={COLOR_OPTIONS} />,
  <StaticChipSelectFilter
    key="treatment"
    label="Treatment"
    options={TREATMENT_OPTIONS}
  />,
];

const GEMSTONE_DRAWER: ReactNode = (
  <>
    <StaticChipSection label="Color" options={COLOR_OPTIONS} separator={false} />
    <StaticChipSection label="Clarity" options={CLARITY_OPTIONS} />
    <StaticChipSection label="Treatment" options={TREATMENT_OPTIONS} />
    <FilterSection label="Price">
      <RangeFilter value={undefined} onChange={() => {}} axes={[PRICE_AXIS]} />
    </FilterSection>
  </>
);

const DEFAULT_BREADCRUMBS: BreadcrumbSegment[] = [
  { label: "Gemstones", href: "#" },
  { label: "Sapphire" },
];

export function GemstonePage({
  breadcrumbs = DEFAULT_BREADCRUMBS,
  title = "Sapphire",
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
      filters={GEMSTONE_FILTERS}
      drawerContent={GEMSTONE_DRAWER}
      searchPlaceholder="Search by certificate number or stock ID..."
      sortOptions={SORT_OPTIONS}
      actions={actions}
    >
      {children}
    </PlpPageShell>
  );
}
