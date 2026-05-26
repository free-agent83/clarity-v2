import { Button, cn, type ButtonProps } from '@nivoda/components';

/** Shared page-action styling for controls in `#nd-page`. */
export const docsPageButtonProps = {
  variant: 'outline',
  size: 'sm',
} as const satisfies Pick<ButtonProps, 'variant' | 'size'>;

/**
 * Matches Clarity outline Button hover/open behaviour for triggers and icons.
 * Trailing icons stay muted at rest, shift to primary-hover on hover; popover
 * triggers pick up the same open surface as aria-expanded outline buttons.
 */
export const docsPageButtonClassName =
  'data-[state=open]:bg-muted data-[state=open]:text-foreground [&_svg]:text-muted-foreground hover:[&_svg]:text-primary-hover data-[state=open]:[&_svg]:text-foreground aria-expanded:[&_svg]:text-foreground';

/** Ghost-style hover for links inside docs popover menus. */
export const docsPopoverMenuItemClassName =
  'inline-flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors outline-none hover:bg-muted hover:text-primary-hover focus-visible:bg-muted focus-visible:text-primary-hover [&_svg]:text-muted-foreground hover:[&_svg]:text-primary-hover focus-visible:[&_svg]:text-primary-hover';

type DocsPageButtonProps = ButtonProps;

export function DocsPageButton({
  className,
  variant,
  size,
  ...props
}: DocsPageButtonProps) {
  return (
    <Button
      variant={variant ?? docsPageButtonProps.variant}
      size={size ?? docsPageButtonProps.size}
      className={cn(docsPageButtonClassName, className)}
      {...props}
    />
  );
}
