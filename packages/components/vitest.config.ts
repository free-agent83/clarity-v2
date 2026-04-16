import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      // Node-based unit tests for pure logic (registries, utils, helpers).
      {
        resolve: {
          alias: {
            "@": resolve(dir, "src"),
          },
        },
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: resolve(dir, ".storybook"),
            storybookScript: "npm run storybook -- --ci",
          }),
        ],
        // Pre-bundle React + JSX runtime + @storybook/test before the browser
        // tests run. Without this, Vite's dep optimizer discovers them
        // mid-test-run on a cold cache (i.e. CI), reloads the test runtime,
        // and whatever story was executing at that moment crashes with
        // `useState` called on a null React (or the dependent radix-ui bundle
        // gets invalidated and components end up with two copies of React).
        // Locally it is hidden by the warm cache from prior runs.
        optimizeDeps: {
          include: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            "react-dom/client",
            "@storybook/test",
          ],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [resolve(dir, ".storybook/vitest.setup.ts")],
        },
      },
    ],
  },
});
