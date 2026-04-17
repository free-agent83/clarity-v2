"use client";

import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../molecules/dropdown-menu/dropdown-menu";
import type { GridItemData } from "../plp-types";

/**
 * Actions column cell for list view.
 *
 * Renders an Add to cart button and a More menu containing platform
 * actions (favorite, share, viewMedia — shown only when the corresponding
 * callback is provided) and any category-specific actions from
 * `data.categoryActions`.
 *
 * Hover-gated: becomes visible on row hover/focus-within and on touch
 * devices (where hover doesn't apply).
 */
export function PlpListActionsCell({ data }: { data: GridItemData }) {
  const hasPlatformActions =
    !!data.onFavorite || !!data.onShare || !!data.onViewMedia;
  const hasCategoryActions =
    !!data.categoryActions && data.categoryActions.length > 0;
  const hasMoreMenu = hasPlatformActions || hasCategoryActions;

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1",
        "opacity-0 transition-opacity group-hover/plp-row:opacity-100 group-focus-within/plp-row:opacity-100",
        "[@media(hover:none)]:opacity-100"
      )}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          data.onAddToCart();
        }}
      >
        Add to cart
      </Button>

      {hasMoreMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More actions"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {data.onFavorite && (
              <DropdownMenuItem
                onSelect={() => data.onFavorite?.(data.id)}
              >
                <IconHeart className="h-4 w-4" />
                Add to shortlist
              </DropdownMenuItem>
            )}
            {data.onShare && (
              <DropdownMenuItem
                onSelect={() => data.onShare?.(data.id)}
              >
                <IconShare className="h-4 w-4" />
                Share
              </DropdownMenuItem>
            )}
            {data.onViewMedia && (
              <DropdownMenuItem
                onSelect={() => data.onViewMedia?.(data.id)}
              >
                <IconPhoto className="h-4 w-4" />
                View media
              </DropdownMenuItem>
            )}
            {hasPlatformActions && hasCategoryActions && (
              <DropdownMenuSeparator />
            )}
            {data.categoryActions?.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onSelect={() => action.onAction(data.id)}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
