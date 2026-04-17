import * as React from "react";

const TABLET_BREAKPOINT = 1024;

/**
 * Returns `true` when the viewport is ≥ 1024px (tablet and above).
 *
 * Follows the same pattern as `useIsMobile` but inverted and tuned to the
 * tablet breakpoint. Used by the PLP template to decide whether list view
 * is available at the current viewport width.
 *
 * Returns `false` during SSR and the first client render, then updates to
 * the actual value after the `matchMedia` listener attaches.
 */
export function useIsTabletUp(): boolean {
  const [isTabletUp, setIsTabletUp] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
    const onChange = () => {
      setIsTabletUp(window.innerWidth >= TABLET_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsTabletUp(window.innerWidth >= TABLET_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTabletUp;
}
