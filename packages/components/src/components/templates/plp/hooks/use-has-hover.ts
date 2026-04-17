import * as React from "react";

/**
 * Returns `true` when the viewport supports hover interaction (pointer
 * devices) via the `(hover: hover)` media query.
 *
 * Returns `false` during SSR and the first client render, then updates
 * to the actual value after the `matchMedia` listener attaches. This
 * means 360 video elements never render during SSR — they only appear
 * after a client-side effect confirms hover support.
 */
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia("(hover: hover)");
    const onChange = () => setHasHover(mql.matches);
    mql.addEventListener("change", onChange);
    setHasHover(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!hasHover;
}
