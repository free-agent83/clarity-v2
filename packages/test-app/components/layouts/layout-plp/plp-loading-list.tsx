"use client";

import * as React from "react";

import { PlpListContainer } from "@nivoda/components";

import { usePlpLoading } from "./plp-loading-context";

export function PlpLoadingList({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isPending } = usePlpLoading();
  return (
    <PlpListContainer header={header} loading={isPending}>
      {children}
    </PlpListContainer>
  );
}
