import { DocsContainer, type DocsContainerProps } from "@storybook/blocks";
import type { PropsWithChildren } from "react";

import { clarityDarkTheme, clarityLightTheme } from "./storybook-theme";
import { applyThemeClass, getThemeModeFromContext } from "./theme-utils";

export function ClarityDocsContainer({
  children,
  context,
}: PropsWithChildren<DocsContainerProps>) {
  const mode = getThemeModeFromContext(context);
  applyThemeClass(mode);

  return (
    <DocsContainer
      context={context}
      theme={mode === "light" ? clarityLightTheme : clarityDarkTheme}
    >
      {children}
    </DocsContainer>
  );
}
