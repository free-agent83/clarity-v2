import { addons } from "@storybook/manager-api";
import { UPDATE_GLOBALS } from "@storybook/core-events";
import { themes } from "@storybook/theming";

function applyManagerTheme(theme: string | undefined) {
  addons.setConfig({
    theme: theme === "light" ? themes.light : themes.dark,
  });
}

applyManagerTheme(undefined);

addons.getChannel().on(
  UPDATE_GLOBALS,
  (event: { globals?: { theme?: string } } | undefined) => {
    applyManagerTheme(event?.globals?.theme);
  }
);
