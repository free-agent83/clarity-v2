"use client";

import * as React from "react";

import { PlpGridContainer } from "@nivoda/components";

import { usePlpLoading } from "./plp-loading-context";

export function PlpLoadingGrid({ children }: { children: React.ReactNode }) {
  const { isPending } = usePlpLoading();
  return <PlpGridContainer loading={isPending}>{children}</PlpGridContainer>;
}
