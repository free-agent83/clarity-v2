"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PlpUserContextValue } from "../plp-types";

const DEFAULT_CONTEXT: PlpUserContextValue = {
  currency: "USD",
  location: "US",
  pricingModel: "standard",
  featureFlags: {},
};

const PlpUserContext = createContext<PlpUserContextValue>(DEFAULT_CONTEXT);

/**
 * Provides user context (currency, location, pricing model, feature flags)
 * for PLP template variant rendering.
 *
 * **Storybook/testing only.** In production, the consuming app supplies
 * user context through its own provider at the app root.
 */
export function PlpUserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: Partial<PlpUserContextValue>;
}) {
  const merged = { ...DEFAULT_CONTEXT, ...value };
  return (
    <PlpUserContext.Provider value={merged}>{children}</PlpUserContext.Provider>
  );
}

/**
 * Reads the current PLP user context.
 *
 * Returns default values (USD, US, standard pricing) when no provider
 * is present — this is intentional so components render sensibly in
 * isolation during development.
 */
export function usePlpUserContext(): PlpUserContextValue {
  return useContext(PlpUserContext);
}
