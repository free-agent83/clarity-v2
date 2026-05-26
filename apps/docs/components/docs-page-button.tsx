import { Button, cn, type ButtonProps } from '@nivoda/components';

/** Shared page-action styling for controls in `#nd-page`. */
export const docsPageButtonProps = {
  variant: 'outline',
  size: 'default',
} as const satisfies Pick<ButtonProps, 'variant' | 'size'>;

/**
 * Matches Clarity outline Button hover/open behaviour for popover triggers.
 * Icons inherit button text colour (currentColor) at rest and on hover.
 */
export const docsPageButtonClassName =
  'data-[state=open]:bg-muted data-[state=open]:text-foreground';

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
