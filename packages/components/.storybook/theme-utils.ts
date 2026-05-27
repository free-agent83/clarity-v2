export type ThemeMode = "light" | "dark";

export function applyThemeClass(theme: ThemeMode | string | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme !== "light");
}

export function resolveThemeMode(
  theme: ThemeMode | string | undefined
): ThemeMode {
  return theme === "light" ? "light" : "dark";
}

type GlobalsCarrier = {
  globals?: { theme?: string };
  store?: {
    userGlobals?: { globals?: { theme?: string } };
    globals?: { globals?: { theme?: string } };
  };
};

export function getThemeModeFromContext(context: GlobalsCarrier): ThemeMode {
  const theme =
    context.globals?.theme ??
    context.store?.userGlobals?.globals?.theme ??
    context.store?.globals?.globals?.theme;

  return resolveThemeMode(theme);
}
