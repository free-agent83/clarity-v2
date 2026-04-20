import { createContext, useContext, type ReactNode } from "react";
import type { AppUserContextValue } from "../src/components/templates/plp/plp-types";

/**
 * Storybook-only emulation of an app-level user context. Lives inside
 * `.storybook/` on purpose — the component library itself does not ship
 * a Context or Provider; library components accept user state as props.
 * This file lets stories emulate an ambient app provider so toolbar
 * globals flow into every story without per-story wiring.
 */

const DEFAULT: AppUserContextValue = {
  currency: "USD",
  location: "US",
  pricingModel: "standard",
  featureFlags: {},
};

const AppUserContext = createContext<AppUserContextValue>(DEFAULT);

export function AppUserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: Partial<AppUserContextValue>;
}) {
  return (
    <AppUserContext.Provider value={{ ...DEFAULT, ...value }}>
      {children}
    </AppUserContext.Provider>
  );
}

/**
 * Hook for stories to read the emulated app user context. Call inside a
 * story's `render` function (or a shared `PlpTemplateInteractive`-style
 * helper) to get the current toolbar-global ⊕ `parameters.appUser`
 * value, then pass it as a `userContext` prop to the library component.
 */
export function useStorybookAppUser(): AppUserContextValue {
  return useContext(AppUserContext);
}
