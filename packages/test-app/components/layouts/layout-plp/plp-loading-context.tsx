"use client";

import * as React from "react";

type PlpLoadingContextValue = {
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
};

const PlpLoadingContext = React.createContext<PlpLoadingContextValue | null>(
  null,
);

export function PlpLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = React.useTransition();
  const value = React.useMemo(
    () => ({ isPending, startTransition }),
    [isPending],
  );
  return (
    <PlpLoadingContext.Provider value={value}>
      {children}
    </PlpLoadingContext.Provider>
  );
}

/**
 * Returns the shared PLP loading state. Safe to call outside a
 * `PlpLoadingProvider` — callers receive a no-op `startTransition` that
 * forwards synchronously, and `isPending` stays `false`. This lets the
 * same filter/pagination client components work inside a provider (where
 * they surface skeleton loading via `PlpGridContainer`) or on their own.
 */
export function usePlpLoading(): PlpLoadingContextValue {
  const ctx = React.useContext(PlpLoadingContext);
  if (ctx) return ctx;
  return {
    isPending: false,
    startTransition: (cb) => cb(),
  };
}
