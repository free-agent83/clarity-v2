"use client";

import { useState } from "react";
import { FilterBar, type FilterOption } from "./filter-bar";

type UncontrolledFilterBarProps = {
  filters: FilterOption[];
};

export function UncontrolledFilterBar({ filters }: UncontrolledFilterBarProps) {
  const [value, setValue] = useState<Record<string, string[]>>({});
  return <FilterBar filters={filters} value={value} onChange={setValue} />;
}
