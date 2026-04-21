import { createContext, useContext, type ReactNode } from "react";

/**
 * Storybook-only emulation of an app-level user context. Lives inside
 * `.storybook/` on purpose — the component library itself does not ship
 * a Context or Provider; library components accept user state as props.
 * This file lets stories emulate an ambient app provider so toolbar
 * globals flow into every story without per-story wiring.
 */

/**
 * Shape of app-level user context that consuming apps pass into library
 * components. Drives variant rendering (currency display, tariff
 * disclosure, legacy pricing, feature flags). The type is a contract —
 * the library does not ship a Context object or Provider. Consuming apps
 * populate and pass this however they want; Storybook emulates it here.
 */
export interface AppUserContextValue {
  currency: string;
  location: string;
  pricingModel: "standard" | "legacy";
  featureFlags?: Record<string, boolean>;
}

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
