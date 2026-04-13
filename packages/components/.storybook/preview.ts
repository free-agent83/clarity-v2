import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
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
