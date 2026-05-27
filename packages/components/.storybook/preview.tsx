import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";
import { AppUserProvider, type AppUserContextValue } from "./app-user-context";
import { ClarityDocsContainer } from "./docs-container";
import { applyThemeClass } from "./theme-utils";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      applyThemeClass(context.globals.theme as string | undefined);
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
          <div className="min-h-full w-full bg-background text-foreground">
            <Story />
          </div>
        </AppUserProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Light or dark color mode",
      defaultValue: "dark",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
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
    backgrounds: { disable: true },
    docs: {
      container: ClarityDocsContainer,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        // Groups are ordered from simpler to more complex — conceptual
        // primitives first, then interactive atoms, then compositions,
        // ending with full-page templates. Within each group the default
        // alphabetical order applies (unless nested overrides exist).
        order: [
          "Foundations", // conceptual primitives
          [
            // Ordered least → most complex: the one-dimensional spacing
            // ramp first, then the theme page (raw colour decisions and
            // semantic pairs), then the brand marks, then the typographic
            // role system, and finally the invisible context primitive
            // that affects descendants.
            "Spacing",
            "Theme",
            "Brand",
            "Brand Express",
            "Typography",
            "Direction",
          ],
          "Display",     // static visual atoms (badge, avatar, separator…)
          "Feedback",    // status (alert, skeleton, spinner…)
          "Actions",     // interactive atoms (button, dropdown, command)
          "Forms",       // data entry atoms (input, select, toggle…)
          "Overlays",    // layered UI (tooltip, popover, dialog…)
          "Navigation",  // structural navigation (breadcrumb, tabs, sidebar…)
          "Data",        // complex data display (table, chart)
          "Filtering",   // composed filtering controls
          "Templates",
          [
            "PLP",
            [
              // Full-page compositions first — show the template end-to-end.
              "GridView",
              "ListView",
              "WithBanner",
              "WithInGridBanner",
              // Structural building blocks of the page.
              "Heading",
              "GridContainer",
              "ListContainer",
              // Item-level primitives that live inside the containers.
              "GridItem",
              "ListRow",
            ],
          ],
        ],
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
