import * as React from "react";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@nivoda/components";

type CommonProps = {
  /** Show a "NEW" pill (or other) badge after the label. */
  badge?: string;
  /** Show a chevron after the label that rotates when `data-state="open"`. */
  withChevron?: boolean;
  /** Mark the item visually as the active route. */
  active?: boolean;
  className?: string;
  children: React.ReactNode;
};

type NavLinkItemProps =
  | (CommonProps & {
      href: string;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    })
  | (CommonProps & {
      href?: undefined;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
    });

const baseClassName = cn(
  "inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-base text-negative-foreground outline-none transition-colors",
  "hover:bg-negative-foreground/10",
  "focus-visible:bg-negative-foreground/10 focus-visible:ring-2 focus-visible:ring-negative-foreground/40",
  "data-[state=open]:bg-negative-foreground/10",
  "data-[active=true]:bg-negative-foreground/10"
);

/**
 * Row item used inside the dark categories strip. Renders as a Next.js
 * `Link` when `href` is provided, otherwise as a `<button>` — the button
 * form is the one we hand to `MegamenuTrigger asChild` for items that
 * open a megamenu.
 *
 * Carries the strip's "negative" styling (white-on-dark), the optional
 * `NEW` badge, and an optional rotating chevron that follows
 * `data-state="open"` set by the trigger.
 */
export const NavLinkItem = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  NavLinkItemProps
>(function NavLinkItem(
  { badge, withChevron = false, active, className, children, ...props },
  ref
) {
  const inner = (
    <>
      <span>{children}</span>
      {badge ? (
        <span className="rounded-full bg-negative-foreground px-1.5 py-0.5 text-xs leading-tight text-primary">
          {badge}
        </span>
      ) : null}
      {withChevron ? (
        <IconChevronDown
          aria-hidden="true"
          className="size-4 transition-transform [[data-state=open]_&]:rotate-180"
        />
      ) : null}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, onClick, ...rest } = props as Extract<
      NavLinkItemProps,
      { href: string }
    >;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        data-active={active || undefined}
        className={cn(baseClassName, className)}
        onClick={onClick}
        {...rest}
      >
        {inner}
      </Link>
    );
  }

  const { onClick, ...rest } = props as Extract<
    NavLinkItemProps,
    { href?: undefined }
  >;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      data-active={active || undefined}
      className={cn(baseClassName, className)}
      onClick={onClick}
      {...rest}
    >
      {inner}
    </button>
  );
});
