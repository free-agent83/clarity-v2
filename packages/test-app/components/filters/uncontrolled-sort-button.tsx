"use client";

import { useState } from "react";
import { SortButton, type SortOption } from "./sort-button";

export function UncontrolledSortButton({ options }: { options: SortOption[] }) {
  const [value, setValue] = useState(options[0].value);
  return <SortButton options={options} value={value} onChange={setValue} />;
}
