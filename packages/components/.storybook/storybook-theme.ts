import { create } from "@storybook/theming";

/**
 * Storybook UI/docs themes aligned with Clarity V2 primitives.
 * These are Storybook chrome tokens — not a substitute for component tokens.
 */
export const clarityLightTheme = create({
  base: "light",
  brandTitle: "Clarity",
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appPreviewBg: "#f5f5f4",
  colorPrimary: "#7655fd",
  colorSecondary: "#1c1917",
  textColor: "#1c1917",
  textMutedColor: "#78716c",
  barTextColor: "#78716c",
  inputBg: "#ffffff",
  inputBorder: "#e7e5e4",
  inputTextColor: "#1c1917",
  appBorderColor: "#e7e5e4",
});

export const clarityDarkTheme = create({
  base: "dark",
  brandTitle: "Clarity",
  appBg: "#1c1917",
  appContentBg: "#1c1917",
  appPreviewBg: "#292524",
  colorPrimary: "#7655fd",
  colorSecondary: "#ffffff",
  textColor: "#ffffff",
  textMutedColor: "#a8a29e",
  barTextColor: "#a8a29e",
  inputBg: "#44403c",
  inputBorder: "rgba(255, 255, 255, 0.1)",
  inputTextColor: "#ffffff",
  appBorderColor: "rgba(255, 255, 255, 0.1)",
});
