import { Button } from "../../../atoms/button/button";

/**
 * Error state for the PLP content area.
 *
 * Renders friendly copy with a retry action and a support link.
 */
export function PlpError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-slot="plp-error">
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn't load the products. Please try again or contact support if
        the problem persists.
      </p>
      <div className="mt-4 flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        <Button variant="outline" asChild>
          <a href="/support">Contact support</a>
        </Button>
      </div>
    </div>
  );
}
