import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";
import { AppUserProvider, type AppUserContextValue } from "./app-user-context";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const fromGlobals = {
        currency: context.globals.currency as string | undefined,
        location: context.globals.location as string | undefined,
        pricingModel: context.globals.pricingModel as
          | AppUserContextValue["pricingModel"]
          | undefined,
      };
      const fromParams = (context.parameters.appUser ?? {}) as Partial<
        AppUserContextValue
      >;
      return (
        <AppUserProvider value={{ ...fromGlobals, ...fromParams }}>
          <Story />
        </AppUserProvider>
      );
    },
  ],
  globalTypes: {
    currency: {
      name: "Currency",
      description: "App user currency",
      defaultValue: "USD",
      toolbar: {
        icon: "circlehollow",
        items: ["USD", "EUR", "GBP"],
        dynamicTitle: true,
      },
    },
    location: {
      name: "Location",
      description: "App user location",
      defaultValue: "US",
      toolbar: {
        icon: "globe",
        items: ["US", "UK", "EU"],
        dynamicTitle: true,
      },
    },
    pricingModel: {
      name: "Pricing model",
      description: "App pricing model",
      defaultValue: "standard",
      toolbar: {
        icon: "paragraph",
        items: ["standard", "legacy"],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // "off" is the default on @storybook/addon-a11y@8.6.x — set explicitly
      // to document intent: violations appear in the Storybook dev UI but do
      // not fail vitest runs. Per-component audits and fixes are deferred to
      // per-component build tickets.
      test: "off",
    },
  },
};

export default preview;
