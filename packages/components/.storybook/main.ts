import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/experimental-addon-test",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const tailwindcss = await import("@tailwindcss/vite");
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss.default());
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": resolve(dir, "../src"),
    };
    config.server = {
      ...config.server,
      headers: {
        ...config.server?.headers,
        "Access-Control-Allow-Origin": "*",
      },
    };
    return config;
  },
};

export default config;
